using CrimeShieldApi.Data;
using CrimeShieldApi.Models;
using Dapper;
using Newtonsoft.Json.Linq;

namespace CrimeShieldApi.Services
{
    public class RouteService
    {
        private readonly GraphHopperService _GraphHopperService;
        private readonly CrimeShieldDapperDbContext _dbcontext;

        public RouteService(GraphHopperService GraphHopperService, CrimeShieldDapperDbContext dbcontext)
        {
            _GraphHopperService = GraphHopperService;
            _dbcontext = dbcontext;
        }

        // Get the route from source to destination
        public async Task<string> GetRoutes(double sourceLat, double sourceLong, double destLat, double destLong)
        {
            try
            {
                // Get the raw route data from OpenRouteService
                var routeData = await _GraphHopperService.GetRoutes(sourceLat, sourceLong, destLat, destLong);
                Console.WriteLine(routeData);
                // Return the raw JSON response from OpenRouteService
                return routeData;
            }
            catch (Exception ex)
            {
                // Log and handle errors
                Console.WriteLine($"Error fetching routes: {ex.Message}");
                return null;
            }
        }


        public async Task<List<double>> GetSafeRoutes(double sourceLat, double sourceLong, double destLat, double destLong)
        {
            try
            {
                // Get the raw route data from OpenRouteService
                var responseData = await GetRoutes(sourceLat, sourceLong, destLat, destLong);

                var jsonResponse = JObject.Parse(responseData);

                // Extract paths (list of possible routes)
                var paths = jsonResponse["paths"] as JArray;

                if (paths == null || paths.Count == 0)
                {
                    Console.WriteLine("No paths available.");
                    return null;
                }

                List<double> safestRoutes = new List<double>();

                // Get the current time in UTC
                var currentUtcTime = DateTime.UtcNow;

                // Convert UTC time to Pakistan Standard Time (UTC + 5)
                var currentPstTime = currentUtcTime.AddHours(5);

                // Print the current time in PST
                Console.WriteLine($"Current PST Time: {currentPstTime.ToString("yyyy-MM-dd HH:mm:ss")}");

                // Time window start and end (1 hour before and after)
                var timeWindowStart = currentPstTime.Add(TimeSpan.FromMinutes(-60));
                var timeWindowEnd = currentPstTime.Add(TimeSpan.FromMinutes(60));

                // Print time window start and end
                Console.WriteLine($"Time Window Start: {timeWindowStart}");
                Console.WriteLine($"Time Window End: {timeWindowEnd}");

                // Prepare the SQL query with the corrected time comparison
                var query = @"
SELECT * FROM CrimeRecords
WHERE 
    CAST(DateTime AT TIME ZONE 'UTC' AS TIME) BETWEEN @TimeStart AND @TimeEnd";

                // Execute the query
                using var connection = _dbcontext.CreateConnection();
                var crimeRecords = await connection.QueryAsync<CrimeRecord>(query, new
                {
                    TimeStart = timeWindowStart.TimeOfDay,  // Pass only the time part
                    TimeEnd = timeWindowEnd.TimeOfDay     // Pass only the time part
                });

                foreach (var path in paths)
                {
                    // For each path, extract points (coordinates)
                    var points = path["points"]["coordinates"] as JArray;

                    if (points != null)
                    {
                        double crimeScore = 0; // Initialize crime score for this route

                        // Iterate over each point in the path and calculate crime score
                        foreach (var point in points)
                        {
                            Console.WriteLine(point);


                            double pointLat = (double)point[1]; // Latitude is at index 1
                            double pointLong = (double)point[0]; // Longitude is at index 0

                            // Calculate the crime score based on proximity to each crime record
                            foreach (var crime in crimeRecords)
                            {
                                double crimeLat = crime.Latitude;
                                double crimeLong = crime.Longitude;

                                // Calculate distance between route point and crime record
                                double distance = CalculateDistance(pointLat, pointLong, crimeLat, crimeLong);
                                //Console.WriteLine($"Point: {pointLat},{pointLong} - Crime: {crimeLat},{crimeLong} - Distance: {distance} km");
                                // If the crime is within a certain radius (e.g., 1 km), increase the crime score
                                if (distance < 1.0) // 1 km radius, adjust based on your needs
                                {
                                    int severity = GetCrimeSeverityScore(crime);
                                    crimeScore += severity;
                                    //Console.WriteLine($"Adding {severity} to score for this crime record.");
                                }
                            }
                        }

                        // After calculating the crime score for this path, add it to the safest routes list
                        safestRoutes.Add(crimeScore);
                        Console.WriteLine($"Crime score for this path: {crimeScore}");
                    }
                }

                // Return safest routes based on your logic (sorting by crime score)
                return safestRoutes;
            }
            catch (Exception ex)
            {
                // Log and handle errors
                Console.WriteLine($"Error fetching routes: {ex.Message}");
                return null;
            }
        }



        public async Task<List<CrimeRecord>> GetCrimeRecords()
        {
            var query = @"
                SELECT * FROM CrimeRecords";
            using var connection = _dbcontext.CreateConnection();
            // Execute query and return list of crime records
            var crimeRecords = await connection.QueryAsync<CrimeRecord>(query);

            return crimeRecords.ToList();

        }

        public double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6378; // Radius of the Earth in kilometers
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var distance = R * c; // Distance in kilometers
            return distance;
        }

        public double ToRadians(double angle)
        {
            return angle * Math.PI / 180.0;
        }


        public int GetCrimeSeverityScore(CrimeRecord crime)
        {
            switch (crime.CrimeSeverity)
            {
                case "High":
                    return 10; // High severity crime
                case "Medium":
                    return 5; // Medium severity crime
                case "Low":
                    return 1; // Low severity crime
                default:
                    return 0; // No severity or unknown
            }
        }

    }
}

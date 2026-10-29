namespace CrimeShieldApi.Services
{
    public class GraphHopperService
    {
        private readonly string ApiKeyy;
        private readonly HttpClient _httpClient;

        public GraphHopperService(IConfiguration configuration)
        {
            ApiKeyy = configuration["GraphHopper:ApiKey"];
            _httpClient = new HttpClient();
        }

        public async Task<string> GetRoutes(double sourceLat, double sourceLong, double destLat, double destLong)
        {
            // Construct the API URL with the 'alternatives' parameter set to true to get multiple routes

            string url = $"https://graphhopper.com/api/1/route?point={sourceLat},{sourceLong}&point={destLat},{destLong}&vehicle=car&locale=en&key={ApiKeyy}&points_encoded=false&alternative_route.max_paths=3&algorithm=alternative_route";


            try
            {

                // Request URL is not logged because it contains the API key

                // Fetch the response from Graphhopper API
                var response = await _httpClient.GetAsync(url);

                // If the response is successful, read the content
                if (response.IsSuccessStatusCode)
                {
                    string responseData = await response.Content.ReadAsStringAsync();
                    Console.WriteLine("Graphhopper Response: " + responseData);  // Log the successful response
                    return responseData;
                }
                else
                {
                    // Log detailed error if the request fails
                    string errorResponse = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Error: {response.StatusCode} - {errorResponse}");
                    return $"Error: {response.StatusCode} - {errorResponse}";
                }
            }
            catch (Exception ex)
            {
                // Log any exceptions that occur during the request
                Console.WriteLine($"Error during Graphhopper API call: {ex.Message}");
                return $"Error: {ex.Message}";
            }
        }
    }
}

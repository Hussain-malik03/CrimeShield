using CrimeShieldApi.Data;
using CrimeShieldApi.DTOs;
using CrimeShieldApi.Services.Contracts;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace CrimeShieldApi.Services.Implementations
{
    public class FindPoliceStationService : IFindPoliceStationService
    {
        private readonly CrimeShieldDbContext _context;

        public FindPoliceStationService(CrimeShieldDbContext context)
        {
            _context = context;
        }

        public async Task<CheckPointResult> CheckBoundariesAsync(double latitude, double longitude)
        {
            // Create a Point object from the latitude and longitude (SRID 4326 is for GPS coordinates)
            var point = new Point(longitude, latitude) { SRID = 4326 };

            // Use raw SQL to query the database for a boundary that contains the point
            var stationdetail = await _context.PoliceStations
                .FromSqlRaw("SELECT name, contact, address FROM \"policestation\" WHERE ST_Contains(\"geom\", ST_SetSRID(ST_MakePoint({0}, {1}), 4326))", latitude, longitude)
                .Select(b => new { b.Name, b.contact, b.address })
                .FirstOrDefaultAsync();

            if (stationdetail == null)
            {
                return null; // Return null if no boundary is found
            }

            // Return the result in the expected format
            return new CheckPointResult
            {
                CurrentLatitude = latitude,
                CurrentLongitude = longitude,
                PoliceStationName = stationdetail.Name,
                ContactNumber = stationdetail.contact,
                Address = stationdetail.address
            };
        }
    }
}

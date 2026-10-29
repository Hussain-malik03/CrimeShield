using CrimeShieldApi.Services.Contracts;
using CrimeShieldApi.Services.Implementations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CrimeShieldApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PoliceStationController : ControllerBase
    {
        private readonly IFindPoliceStationService _FindPoliceStationService;

        public PoliceStationController(IFindPoliceStationService FindPoliceStationService)
        {
            _FindPoliceStationService = FindPoliceStationService;
        }

        // GET endpoint to retrieve the boundary for the given latitude and longitude
        [HttpGet("/api/getcurrentpolicestation")]
        public async Task<IActionResult> CheckBoundaries([FromQuery] double latitude, [FromQuery] double longitude)
        {
            // Use the service to check the boundaries
            var result = await _FindPoliceStationService.CheckBoundariesAsync(latitude, longitude);

            // If no boundary is found, return NotFound
            if (result == null)
            {
                return NotFound(new { message = "No police station found for the given coordinates." });
            }

            // Return the result in the expected format
            return Ok(result);
        }
    }
}

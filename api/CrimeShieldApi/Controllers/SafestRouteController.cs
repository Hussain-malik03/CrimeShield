using CrimeShieldApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CrimeShieldApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SafestRouteController : ControllerBase
    {
        private readonly RouteService _routeService;

        public SafestRouteController(RouteService routeService)
        {
            _routeService = routeService;
        }

        [HttpGet("paths")]
        public async Task<IActionResult> GetRoutes(double sourceLat, double sourceLong, double destLat, double destLong)
        {
            var routeDatamain = await _routeService.GetRoutes(sourceLat, sourceLong, destLat, destLong);

            if (routeDatamain == null)
            {
                return NotFound("No routes found.");
            }

            return Ok(routeDatamain);
        }

        [HttpGet("paths-scores")]
        public async Task<IActionResult> GetSafeRoutes(double sourceLat, double sourceLong, double destLat, double destLong)
        {
            var routeData = await _routeService.GetSafeRoutes(sourceLat, sourceLong, destLat, destLong);

            if (routeData == null)
            {
                return NotFound("No routes found.");
            }

            return Ok(routeData);
        }
    }
}

using CrimeShieldApi.Data;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace CrimeShieldApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DbTestController : ControllerBase
    {
        private readonly CrimeShieldDapperDbContext _dbContext;

        public DbTestController(CrimeShieldDapperDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("test-connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                using var connection = _dbContext.CreateConnection() as NpgsqlConnection;

                if (connection == null)
                    return StatusCode(500, "Failed to create a valid database connection.");

                await connection.OpenAsync();

                var result = await connection.QueryFirstOrDefaultAsync<string>("SELECT version();");

                return Ok(new
                {
                    message = "Connection successful!",
                    postgresVersion = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Connection failed.",
                    error = ex.Message
                });
            }
        }
    }
}

using Npgsql;
using System.Data;

namespace CrimeShieldApi.Data
{
    public class CrimeShieldDapperDbContext
    {
        private readonly string _connectionString;

        public CrimeShieldDapperDbContext(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);
    }
}

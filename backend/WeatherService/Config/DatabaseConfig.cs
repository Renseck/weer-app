using Microsoft.Extensions.Configuration;
using WeatherService.Factories;

namespace WeatherService.Config
{
    public class DatabaseConfig
    {
        private readonly IConfiguration _configuration;

        /* ====================================================================================== */
        public DatabaseConfig(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /* ====================================================================================== */

        public string ConnectionString => _configuration.GetConnectionString("DefaultConnection");

        /* ====================================================================================== */
        public WeatherRepositoryFactory.RepositoryType RepositoryType
        {
            get
            {
                string repositoryType = _configuration["RepositoryType"]
                    ?? _configuration["Database:RepositoryType"]
                    ?? "MySql";

                return repositoryType.ToLower() switch
                {
                    "sqlite" => WeatherRepositoryFactory.RepositoryType.SQLite,
                    "inmemory" => WeatherRepositoryFactory.RepositoryType.InMemory,
                    "mysql" => WeatherRepositoryFactory.RepositoryType.MySql,
                    _ => WeatherRepositoryFactory.RepositoryType.MySql
                };
            }
        }
    }
}
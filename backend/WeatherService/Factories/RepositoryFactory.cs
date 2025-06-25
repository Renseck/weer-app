using Microsoft.EntityFrameworkCore;
using WeatherService.Data;
using WeatherService.Repositories;

namespace WeatherService.Factories
{
    public class WeatherRepositoryFactory
    {
        public enum RepositoryType
        {
            MySql,
            SQLite,
            InMemory,
        }

        /* ====================================================================================== */
        public static IWeatherRepository CreateRepository(RepositoryType type, string connectionString)
        {
            switch (type)
            {
                case RepositoryType.MySql:
                    var optionsBuilder = new DbContextOptionsBuilder<WeatherDbContext>();
                    optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
                    var context = new WeatherDbContext(optionsBuilder.Options);
                    return new MySqlWeatherRepository(context);

                case RepositoryType.SQLite:
                    // Implement SQLite repository
                    throw new NotImplementedException("SQLite repository not yet implemented");

                case RepositoryType.InMemory:
                    throw new NotImplementedException("In-memory repostory not yet implemented");

                default:
                    throw new ArgumentException($"Unknown repository type: {type}");
            }
        }
    }
}
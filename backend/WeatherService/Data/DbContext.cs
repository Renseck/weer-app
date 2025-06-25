using Microsoft.EntityFrameworkCore;
using WeatherService.Models;

namespace WeatherService.Data
{
    public class WeatherDbContext : DbContext
    {
        public DbSet<Station> Stations { get; set; }
        public DbSet<WeatherData> WeatherData { get; set; }
        public DbSet<Location> Locations { get; set; }
        	
        /* ====================================================================================== */
        public WeatherDbContext(DbContextOptions<WeatherDbContext> options)
            : base(options)
        {
        }

        /* ====================================================================================== */
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure Station entity
            modelBuilder.Entity<Station>()
                .ToTable("stations");

            modelBuilder.Entity<Station>()
                .HasKey(s => s.StationId);

            modelBuilder.Entity<Station>()
                .Property(s => s.StationName)
                .HasColumnName("station_name");

            modelBuilder.Entity<Station>()
                .Property(s => s.Lat)
                .HasColumnName("latitude")
                .HasPrecision(5, 2);

            modelBuilder.Entity<Station>()
                .Property(s => s.Lon)
                .HasColumnName("longitude")
                .HasPrecision(5, 2);

            modelBuilder.Entity<Station>()
                .Property(s => s.Regio)
                .HasColumnName("regio");

            modelBuilder.Entity<Station>()
                .Property(s => s.LastUpdated)
                .HasColumnName("last_updated")
                .HasColumnType("datetime(0)")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Configure WeatherData entity
            modelBuilder.Entity<WeatherData>()
                .ToTable("weather_data");

            modelBuilder.Entity<WeatherData>()
                .HasKey(w => w.Id);

            modelBuilder.Entity<WeatherData>()
                .Property(w => w.StationId)
                .HasColumnName("station_id");

            modelBuilder.Entity<WeatherData>()
                .Property(w => w.Temperature)
                .HasColumnName("temperature")
                .HasPrecision(5, 1);

            modelBuilder.Entity<WeatherData>()
                .Property(w => w.GroundTemperature)
                .HasColumnName("ground_temperature")
                .HasPrecision(5, 1);

            modelBuilder.Entity<WeatherData>()
                .Property(w => w.FeelTemperature)
                .HasColumnName("feel_temperature")
                .HasPrecision(5, 1);

            modelBuilder.Entity<WeatherData>()
                .Property(w => w.WeatherDescription)
                .HasColumnName("weather_description");

            modelBuilder.Entity<WeatherData>()
                .Property(w => w.Humidity)
                .HasColumnName("humidity")
                .HasPrecision(3, 1);

            modelBuilder.Entity<WeatherData>()
                .Property(w => w.WindSpeed)
                .HasColumnName("wind_speed")
                .HasPrecision(5, 2);

            modelBuilder.Entity<WeatherData>()
                .Property(w => w.WindSpeedBft)
                .HasColumnName("wind_speed_bft")
                .HasPrecision(2, 0);

            modelBuilder.Entity<WeatherData>()
                .Property(w => w.WindDirection)
                .HasColumnName("wind_direction");

            modelBuilder.Entity<WeatherData>()
                .Property(w => w.WindDirectionDegrees)
                .HasColumnName("wind_direction_degrees")
                .HasPrecision(5, 1);

            modelBuilder.Entity<WeatherData>()
                .Property(w => w.RainfallLastHour)
                .HasColumnName("rainfall_last_hour")
                .HasPrecision(5, 2);

            modelBuilder.Entity<WeatherData>()
                .Property(w => w.SunPower)
                .HasColumnName("sun_power")
                .HasPrecision(4, 0);

            modelBuilder.Entity<WeatherData>()
                .Property(w => w.Timestamp)
                .HasColumnName("timestamp")
                .HasColumnType("datetime(0)")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Configure relationship
            modelBuilder.Entity<WeatherData>()
                .HasOne(w => w.Station)
                .WithMany(s => s.WeatherData)
                .HasForeignKey(w => w.StationId);

            // Configure Location entity
            modelBuilder.Entity<Location>()
                .ToTable("locations");

            modelBuilder.Entity<Location>()
                .HasKey(l => l.Id);

            modelBuilder.Entity<Location>()
                .Property(l => l.Postcode)
                .HasColumnName("postcode");

            modelBuilder.Entity<Location>()
                .Property(l => l.Woonplaats)
                .HasColumnName("woonplaats");

            modelBuilder.Entity<Location>()
                .Property(l => l.Gemeente)
                .HasColumnName("gemeente");

            modelBuilder.Entity<Location>()
                .Property(l => l.Provincie)
                .HasColumnName("provincie");

            modelBuilder.Entity<Location>()
                .Property(l => l.Lat)
                .HasColumnName("latitude")
                .HasPrecision(5, 2);

            modelBuilder.Entity<Location>()
                .Property(l => l.Lon)
                .HasColumnName("longitude")
                .HasPrecision(5, 2);
                
            modelBuilder.Entity<Location>()
                .Property(l => l.Soort)
                .HasColumnName("soort");
        }
    }
}
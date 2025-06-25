using Microsoft.EntityFrameworkCore;
using WeatherService.Config;
using WeatherService.Data;
using WeatherService.Factories;
using WeatherService.Repositories;
using WeatherService.Services;
using WeatherService.API.Middleware;
using WeatherService.API.Services;

namespace WeatherService.API
{
    public static class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var app = ConfigureApp(builder);
            app.Run();
        }

        /* ====================================================================================== */
        public static WebApplication ConfigureApp(WebApplicationBuilder builder)
        {
            AppConstants.Announce("Weather API starting up...", "info");

            // Add services to the container.
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddOpenApiDocument(config =>
            {
                config.Title = "Weather API";
                config.Version = "v1";
                config.Description = "API for Weather Service backend";
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAngularApp",
                    policy => policy
                        .WithOrigins("http://localhost:4200") // Your Angular app URL
                        .AllowAnyMethod()
                        .AllowAnyHeader());
            });

            var dbConfig = new DatabaseConfig(builder.Configuration);
            AppConstants.Announce($"Using database: {dbConfig.RepositoryType}", "info");

            builder.Services.AddDbContext<WeatherDbContext>(options =>
                options.UseMySql(dbConfig.ConnectionString,
                    ServerVersion.AutoDetect(dbConfig.ConnectionString)));

            builder.Services.AddSingleton<IHttpClientService, HttpClientService>();
            builder.Services.AddSingleton<IRequestPerformanceService, RequestPerformanceService>();
            builder.Services.AddScoped<IWeatherDataService, BuienradarWeatherService>();
            builder.Services.AddScoped<IWeatherRepository>(sp =>
                WeatherRepositoryFactory.CreateRepository(
                    dbConfig.RepositoryType,
                    dbConfig.ConnectionString));
            builder.Services.AddScoped<IWeatherStorageService, WeatherStorageService>();
            builder.Services.AddScoped<WeatherDataCoordinator>();

            builder.Services.AddAutoMapper(typeof(Program).Assembly);
            var app = builder.Build();

            // Add request logging middleware
            app.UseRequestLogging();

            if (app.Environment.IsDevelopment())
            {
                app.UseOpenApi();
                app.UseSwaggerUi();
                AppConstants.Announce("Swagger UI available at /swagger", "info");
            }

            app.UseCors("AllowAngularApp");  // Add CORS middleware
            app.MapControllers();
            app.MapGet("/", () => "Testing that it's working!");

            AppConstants.Announce("Weather API is now running!", "success");

            return app;
        }
    }
}
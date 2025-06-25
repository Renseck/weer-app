using System.Globalization;
using Microsoft.Extensions.Configuration;
using WeatherService.Config;
using WeatherService.Factories;
using WeatherService.Services;
using WeatherService.Models;
using static WeatherService.Config.AppConstants;

namespace WeatherService
{
    public class Program
    {
        private static readonly string CancelKeyword = "stop";
        private static CancellationTokenSource _cancellationTokenSource = new();
        private static WeatherSchedulingService? _schedulingService;
        
        /* ====================================================================================== */
        public static async Task Main(string[] args)
        {
            try
            {
                Announce($"Weather Service starting. Enter '{CancelKeyword}' to exit.", "info");
                var coordinator = await InitializeServicesAsync();

                var configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", optional: false)
                    .Build();

                _schedulingService = new WeatherSchedulingService(coordinator, configuration);

                // Run once on starting, then start the scheduled execution
                await _schedulingService.RunOnceAsync();
                await _schedulingService.StartAsync();

                _ = Task.Run(MonitorConsoleInput);

                await WaitForShutdownAsync();

                if (_schedulingService != null)
                {
                    await _schedulingService.StopAsync();
                }

                Announce("Weather Service stopped.", "info");
            }
            catch (Exception ex)
            {
                HandleException(ex);
            }
        }
        
        /* ====================================================================================== */
        private static async Task<WeatherDataCoordinator> InitializeServicesAsync()
        {
            var httpClientService = new HttpClientService();
            var weatherDataService = new BuienradarWeatherService(httpClientService);

            // Setup database
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false)
                .Build();

            var dbConfig = new DatabaseConfig(configuration);

            var repository = WeatherRepositoryFactory.CreateRepository(
                dbConfig.RepositoryType,
                dbConfig.ConnectionString);

            var storageService = new WeatherStorageService(repository);

            var coordinator = new WeatherDataCoordinator(weatherDataService, storageService);

            Announce("Initializing database...");
            await coordinator.InitializeAsync();
            Announce("Database initialized!\n", "success");

            return coordinator;
        }

        /* ====================================================================================== */
        private static void MonitorConsoleInput()
        {
            while (ApplicationState.IsRunning)
            {
                var input = Console.ReadLine();
                if (input?.ToLower() == CancelKeyword)
                {
                    Announce("Cancellation requested. Stopping the service...", "warning");
                    ApplicationState.RequestShutdown();
                    break;
                }
                else if (input?.ToLower() == "help")
                    Announce($"Enter '{CancelKeyword}' to stop the service.");
            }
        }

        /* ====================================================================================== */
        private static async Task WaitForShutdownAsync()
        {
            while (ApplicationState.IsRunning)
            {
                await Task.Delay(500);
            }
        }

        /* ====================================================================================== */
        private static void HandleException(Exception ex)
        {
            Announce($"Main scheduling encountered error: {ex.Message}", "error");
            if (ex.InnerException != null)
            {
                Announce($"Inner exception: {ex.InnerException.Message}", "error");
                Announce($"Stack trace: {ex.InnerException.StackTrace}", "error");
            }
        }
    }
}
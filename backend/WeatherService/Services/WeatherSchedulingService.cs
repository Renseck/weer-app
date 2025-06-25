using Quartz;
using Quartz.Impl;
using WeatherService.Config;
using WeatherService.Models;
using System.Globalization;
using static WeatherService.Config.AppConstants;
using Microsoft.Extensions.Configuration;

namespace WeatherService.Services
{
    public class WeatherSchedulingService
    {
        private readonly WeatherDataCoordinator _coordinator;
        private readonly SchedulingConfig _schedulingConfig;
        private IScheduler? _scheduler;
        private static readonly CancellationTokenSource _cancellationTokenSource = new();

        /* ====================================================================================== */
        public WeatherSchedulingService(WeatherDataCoordinator coordinator, IConfiguration configuration)
        {
            _coordinator = coordinator;
            _schedulingConfig = SchedulingConfig.FromConfiguration(configuration);
        }

        /* ====================================================================================== */
        /// <summary>
        /// Start the scheduling service with a job that runs every ten minutes at 5, 15, 25, 35, 45, 55
        /// minutes past the hour
        /// </summary>
        public async Task StartAsync()
        {
            var factory = new StdSchedulerFactory();
            _scheduler = await factory.GetScheduler();

            var job = JobBuilder.Create<WeatherDataCollectionJob>()
                .WithIdentity("weatherDataJob", "weatherGroup")
                .Build();

            string cronExpression = _schedulingConfig.ToCronExpression();

            var trigger = TriggerBuilder.Create()
                .WithIdentity("weatherTrigger", "weatherGroup")
                .WithCronSchedule(cronExpression)
                .Build();

            _scheduler.Context.Put("coordinator", _coordinator);
            await _scheduler.ScheduleJob(job, trigger);
            await _scheduler.Start();

            string scheduleDescription = _schedulingConfig.GetDescription();
            Announce($"Weather data collection scheduled {scheduleDescription}", "info");

            var nextRun = trigger.GetNextFireTimeUtc()?.LocalDateTime;
            if (nextRun.HasValue)
            {
                Announce($"Next scheduled run: {nextRun:HH:mm:ss}", "info");
            }   
            
        }

        /* ====================================================================================== */
        public async Task StopAsync()
        {
            if (_scheduler != null)
            {
                await _scheduler.Shutdown();
                Announce("Weather scheduling service stopped.", "info");
            }
        }

        /* ====================================================================================== */
        public async Task RunOnceAsync()
        {
            Announce("Running immediate weather data collection...");

            try
            {
                var (stations, validCount) = await _coordinator.FetchAndStoreWeatherDataAsync();
                int totalCount = stations.Count;
                int invalidCount = totalCount - validCount;

                Announce($"Collected data from {stations.Count} weather stations", "info");
                Announce($"\tProcessed: {validCount} valid stations, {invalidCount} invalid stations skipped", "info");

                if (stations.Count > 0)
                {
                    await DisplayStationDataByNameAsync("arnhem");
                    // DisplayAllStations(stations);
                }
                else
                {
                    Announce("No weather station data found in the response", "warning");
                }
            }
            catch (Exception ex)
            {
                Announce($"Error collecting weather data: {ex.Message}", "error");
                if (ex.InnerException != null)
                {
                    Announce($"Inner exception: {ex.InnerException.Message}", "error");
                    Announce($"Stack trace: {ex.InnerException.StackTrace}", "error");
                }
            }
        }

        /* ====================================================================================== */
        private async Task DisplayStationDataByNameAsync(string stationName)
        {
            Console.WriteLine("\nExample of station readout:");
            var stationData = await _coordinator.GetStationByNameAsync(stationName);

            if (stationData.station != null && stationData.weatherData != null)
            {
                var station = stationData.station;
                var data = stationData.weatherData;

                string lat = station.Lat.ToString(new CultureInfo("en-US"));
                string lon = station.Lon.ToString(new CultureInfo("en-US"));

                Console.WriteLine($"Station: {station.StationName} [{lat}°N, {lon}°E]");
                Console.WriteLine($"Last measurement: {data.Timestamp}");
                Console.WriteLine($"Temperatuur: {data.Temperature}°C");
                Console.WriteLine($"Grondtemperatuur: {data.GroundTemperature}°C");
                Console.WriteLine($"Gevoelstemperatuur: {data.FeelTemperature}°C");
                Console.WriteLine($"Weerbeschrijving: {data.WeatherDescription}");
                Console.WriteLine($"Luchtvochtigheid: {data.Humidity}%");
                Console.WriteLine($"Wind: {data.WindSpeed} km/h, Richting: {data.WindDirection} ({data.WindDirectionDegrees}°)");
                Console.WriteLine($"Regen in het laatste uur: {data.RainfallLastHour}mm");
                Console.WriteLine($"Zonnekracht: {data.SunPower} W/m2.\n");
            }

            else
            {
                Announce($"Station '{stationName}' not found.", "warning");
            }
        }

        /* ====================================================================================== */
        private static void DisplayAllStations(List<WeatherRecord> stations)
        {
            Console.WriteLine("\nAlle stations:");
            foreach (var s in stations)
            {
                bool invalid = s.Temperature == -999m;
                Console.WriteLine($"{(invalid ? "[INVALID] " : "")}- {s.StationName}: {s.Temperature}°C ({s.WeatherDescription})");
            }
        }
    }
}
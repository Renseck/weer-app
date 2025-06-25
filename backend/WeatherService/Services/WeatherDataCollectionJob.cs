using Quartz;
using static WeatherService.Config.AppConstants;

namespace WeatherService.Services
{
    [DisallowConcurrentExecution]
    public class WeatherDataCollectionJob : IJob
    {
        public async Task Execute(IJobExecutionContext context)
        {
            try
            {
                var coordinator = (WeatherDataCoordinator)context.Scheduler.Context.Get("coordinator");
                Announce("\nRunning scheduled weather data collection", "info");

                var (stations, validCount) = await coordinator.FetchAndStoreWeatherDataAsync();
                int totalCount = stations.Count;
                int invalidCount = totalCount - validCount;

                Announce($"Collected data from {stations.Count} weather stations", "success");
                Announce($"\tProcessed: {validCount} valid stations, {invalidCount} invalid stations skipped", "info");
            }
            catch (Exception ex)
            {
                Announce($"Error in weather data collection job: {ex.Message}", "error");
                if (ex.InnerException != null)
                {
                    Announce($"Inner exception: {ex.InnerException.Message}", "error");
                    Announce($"Stack trace: {ex.InnerException.StackTrace}", "error");
                }
            }
        }
    }
}
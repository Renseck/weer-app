using WeatherService.Models;

namespace WeatherService.Services
{
    public interface IWeatherDataService
    {
        Task<List<WeatherRecord>> GetAllWeatherStationsAsync();
    }
    public class BuienradarWeatherService : IWeatherDataService
    {
        private const string BuienradarApiUrl = "https://data.buienradar.nl/2.0/feed/json";
        private readonly IHttpClientService _httpClientService;

        /* ====================================================================================== */
        public BuienradarWeatherService(IHttpClientService httpClientService)
        {
            _httpClientService = httpClientService;
        }

        /* ====================================================================================== */
        /// <summary>
        /// Gets all weather stations from the Buienradar API
        /// </summary>
        /// <returns>A list of weather stations with measurement data</returns>
        public async Task<List<WeatherRecord>> GetAllWeatherStationsAsync()
        {
            try
            {
                BuienradarResponse response = await _httpClientService.GetJsonAsync<BuienradarResponse>(BuienradarApiUrl);
                return response?.Actual?.StationMeasurements ?? new List<WeatherRecord>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching weather data: {ex.Message}");
                return new List<WeatherRecord>();
            }
        }

    }

}
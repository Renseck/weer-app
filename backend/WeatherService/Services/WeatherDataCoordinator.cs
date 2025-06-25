using WeatherService.Models;

namespace WeatherService.Services
{
    public class WeatherDataCoordinator
    {
        private readonly IWeatherDataService _weatherDataService;
        private readonly IWeatherStorageService _storageService;

        /* ====================================================================================== */
        /*                     DATA COLLECTION METHODS (for scheduled polling)                    */
        /* ====================================================================================== */

        /* ====================================================================================== */
        public WeatherDataCoordinator(
            IWeatherDataService weatherDataService, IWeatherStorageService storageService)
        {
            _weatherDataService = weatherDataService;
            _storageService = storageService;
        }

        /* ====================================================================================== */
        public async Task InitializeAsync()
        {
            await _storageService.InitializeAsync();
        }

        /* ====================================================================================== */
        public async Task<(List<WeatherRecord> stations, int validCount)> FetchAndStoreWeatherDataAsync()
        {
            var weatherRecords = await _weatherDataService.GetAllWeatherStationsAsync();

            int validCount = 0;
            if (weatherRecords.Count > 0)
            {
                var result = await _storageService.StoreWeatherDataAsync(weatherRecords);
                validCount = result.validCount;
            }

            return (weatherRecords, validCount);
        }

        /* ====================================================================================== */

        /* ====================================================================================== */
        /*                          DATA RETRIEVEVL METHODS (for API etc)                         */
        /*                       (None of these trigger external API calls)                       */
        /* ====================================================================================== */

        /* ====================================================================================== */
        public async Task<IEnumerable<(Station station, WeatherData weatherData)>> GetAllStationsWithLatestDataAsync()
        {
            return await _storageService.GetAllStationsWithLatestDataAsync();
        }

        /* ====================================================================================== */
        public async Task<(Station station, WeatherData weatherData)> GetStationByNameAsync(string name)
        {
            return await _storageService.GetStationWithLatestDataByNameAsync(name);
        }

        /* ====================================================================================== */
        public async Task<IEnumerable<WeatherData>> GetHistoricalDataForStationAsync(int stationId, DateTime startDate, DateTime endDate)
        {
            return await _storageService.GetHistoricalDataForStationAsync(stationId, startDate, endDate);
        }

        /* ====================================================================================== */
        public async Task<(Station station, WeatherData weatherData, Location location)> GetNearestStationToLocationAsync(string locationName)
        {
            return await _storageService.GetNearestStationToLocationAsync(locationName);
        }

        /* ====================================================================================== */
        public async Task<IEnumerable<Location>> GetAllLocationsAsync(int limit = 5000, int offset = 0)
        {
            return await _storageService.GetAllLocationsAsync(limit, offset);
        }
    }
}
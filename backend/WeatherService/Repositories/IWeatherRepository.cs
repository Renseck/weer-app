using WeatherService.Models;

namespace WeatherService.Repositories
{
    public interface IWeatherRepository
    {
        Task InitializeAsync();
        Task SaveWeatherDataAsync(Station station, WeatherData weatherData);
        Task SaveAllWeatherDataAsync(IEnumerable<(Station station, WeatherData weatherData)> records);
        Task<IEnumerable<Station>> GetAllStationsAsync();
        Task<Station> GetStationByNameAsync(string name);
        Task<IEnumerable<WeatherData>> GetWeatherDataForStationAsync(int stationId, int limit = 10);
        Task<WeatherData> GetLatestWeatherDataForStationAsync(int stationId);
        Task<IEnumerable<WeatherData>> GetHistoricalDataForStationAsync(int stationId, DateTime startDate, DateTime endDate);

        // Location methods
        Task<Location> GetLocationByNameAsync(string name);
        Task<(Station station, WeatherData weatherData, Location location)> GetNearestStationToLocationAsync(string LocationName);
        Task<IEnumerable<Location>> GetAllLocationsAsync(int limit = 5000, int offset = 0);
    }
}
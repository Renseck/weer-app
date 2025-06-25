using WeatherService.Factories;
using WeatherService.Models;
using WeatherService.Repositories;

namespace WeatherService.Services
{
    public interface IWeatherStorageService
    {
        Task InitializeAsync();
        Task<(int totalCount, int validCount)> StoreWeatherDataAsync(List<WeatherRecord> records);
        Task<IEnumerable<(Station station, WeatherData weatherData)>> GetAllStationsWithLatestDataAsync();
        Task<(Station station, WeatherData weatherData)> GetStationWithLatestDataByNameAsync(string name);
        Task<IEnumerable<WeatherData>> GetHistoricalDataForStationAsync(int stationId, DateTime startDate, DateTime endDate);
        Task<(Station station, WeatherData weatherData, Location location)> GetNearestStationToLocationAsync(string locationName);
        Task<IEnumerable<Location>> GetAllLocationsAsync(int limit = 5000, int offset = 0);
    }

    /* ========================================================================================== */
    public class WeatherStorageService : IWeatherStorageService
    {
        private readonly IWeatherRepository _repository;

        /* ====================================================================================== */
        public WeatherStorageService(IWeatherRepository repository)
        {
            _repository = repository;
        }

        /* ====================================================================================== */
        public async Task InitializeAsync()
        {
            await _repository.InitializeAsync();
        }

        /* ====================================================================================== */
        public async Task<(int totalCount, int validCount)> StoreWeatherDataAsync(List<WeatherRecord> records)
        {
            var stationDataPairs = new List<(Station, WeatherData)>();
            int totalCount = records.Count;
            int validCount = 0;

            foreach (var record in records)
            {
                // Skip invalid records (temperature = -999m)
                if (record.Temperature == -999m)
                {
                    continue;
                }

                validCount++;

                var station = new Station
                {
                    StationId = record.StationId,
                    StationName = record.StationName,
                    Lat = record.Lat,
                    Lon = record.Lon,
                    Regio = record.Regio,
                    LastUpdated = DateTime.Now
                };

                var weatherData = new WeatherData
                {
                    StationId = record.StationId,
                    WeatherDescription = record.WeatherDescription,
                    AirPressure = record.AirPressure,
                    WindDirection = record.WindDirection,
                    WindDirectionDegrees = record.WindDirectionDegrees,
                    Temperature = record.Temperature,
                    GroundTemperature = record.GroundTemperature,
                    FeelTemperature = record.FeelTemperature,
                    Humidity = record.Humidity,
                    WindSpeed = record.WindSpeed,
                    WindSpeedBft = record.WindSpeedBft,
                    RainfallLastHour = record.RainfallLastHour,
                    SunPower = record.SunPower,
                    Timestamp = record.Timestamp
                };

                stationDataPairs.Add((station, weatherData));
            }

            if (stationDataPairs.Count > 0)
                await _repository.SaveAllWeatherDataAsync(stationDataPairs);

            return (totalCount, validCount);
        }

        /* ====================================================================================== */
        public async Task<IEnumerable<(Station station, WeatherData weatherData)>> GetAllStationsWithLatestDataAsync()
        {
            var result = new List<(Station station, WeatherData weatherData)>();
            var stations = await _repository.GetAllStationsAsync();

            foreach (var station in stations)
            {
                var latestData = await _repository.GetLatestWeatherDataForStationAsync(station.StationId);
                if (latestData != null)
                {
                    result.Add((station, latestData));
                }
            }

            return result;
        }

        /* ====================================================================================== */
        public async Task<(Station station, WeatherData weatherData)> GetStationWithLatestDataByNameAsync(string name)
        {
            var station = await _repository.GetStationByNameAsync(name);
            if (station == null)
            {
                return (null, null);
            }

            var latestData = await _repository.GetLatestWeatherDataForStationAsync(station.StationId);
            return (station, latestData);
        }

        /* ====================================================================================== */
        public async Task<IEnumerable<WeatherData>> GetHistoricalDataForStationAsync(int stationId, DateTime startDate, DateTime endDate)
        {
            return await _repository.GetHistoricalDataForStationAsync(stationId, startDate, endDate);
        }

        /* ====================================================================================== */
        public async Task<(Station station, WeatherData weatherData, Location location)> GetNearestStationToLocationAsync(string locationName)
        {
            return await _repository.GetNearestStationToLocationAsync(locationName);
        }

        /* ====================================================================================== */
        public async Task<IEnumerable<Location>> GetAllLocationsAsync(int limit = 5000, int offset = 0)
        {
            return await _repository.GetAllLocationsAsync(limit, offset);
        }
    }

    /* ========================================================================================== */
}
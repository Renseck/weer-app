using Microsoft.EntityFrameworkCore;
using WeatherService.Data;
using WeatherService.Models;
using WeatherService.Utils;

namespace WeatherService.Repositories
{
    public class MySqlWeatherRepository : IWeatherRepository
    {
        private readonly WeatherDbContext _context;

        /* ====================================================================================== */
        public MySqlWeatherRepository(WeatherDbContext context)
        {
            _context = context;
        }

        /* ====================================================================================== */
        public async Task InitializeAsync()
        {
            await _context.Database.EnsureCreatedAsync();
        }

        /* ====================================================================================== */
        public async Task SaveWeatherDataAsync(Station station, WeatherData weatherData)
        {
            // Handle station
            var existingStation = await _context.Stations.FindAsync(station.StationId);

            if (existingStation == null)
            {
                await _context.Stations.AddAsync(station);
            }
            else
            {
                existingStation.StationName = station.StationName;
                existingStation.Lat = station.Lat;
                existingStation.Lon = station.Lon;
                existingStation.Regio = station.Regio;
                existingStation.LastUpdated = DateTime.Now;
                _context.Stations.Update(existingStation);
            }

            // Prevent double entries
            bool dataExists = await _context.WeatherData
                .AnyAsync(w => w.StationId == station.StationId &&
                               w.Timestamp == weatherData.Timestamp);

            // Add weather data
            if (!dataExists)
            {
                weatherData.StationId = station.StationId;
                await _context.WeatherData.AddAsync(weatherData);
            }

            await _context.SaveChangesAsync();
        }

        /* ====================================================================================== */
        public async Task SaveAllWeatherDataAsync(IEnumerable<(Station station, WeatherData weatherData)> records)
        {
            var existingStationIds = await _context.Stations.Select(s => s.StationId).ToListAsync();

            foreach (var (station, weatherData) in records)
            {
                if (!existingStationIds.Contains(station.StationId))
                {
                    // Add new station
                    await _context.Stations.AddAsync(station);
                    existingStationIds.Add(station.StationId);
                }
                else
                {
                    // Update existing station
                    var existingStation = await _context.Stations.FindAsync(station.StationId);
                    existingStation.StationName = station.StationName;
                    existingStation.Lat = station.Lat;
                    existingStation.Lon = station.Lon;
                    existingStation.Regio = station.Regio;
                    existingStation.LastUpdated = DateTime.Now;
                    _context.Stations.Update(existingStation);
                }

                // Prevent double entries
                bool dataExists = await _context.WeatherData
                    .AnyAsync(w => w.StationId == station.StationId &&
                                w.Timestamp == weatherData.Timestamp);

                // Add weather data
                if (!dataExists)
                {
                    weatherData.StationId = station.StationId;
                    await _context.WeatherData.AddAsync(weatherData);
                }
            }

            await _context.SaveChangesAsync();
        }

        /* ====================================================================================== */
        public async Task<IEnumerable<Station>> GetAllStationsAsync()
        {
            return await _context.Stations.ToListAsync();
        }

        /* ====================================================================================== */
        public async Task<Station> GetStationByNameAsync(string name)
        {
            return await _context.Stations
                .FirstOrDefaultAsync(s => EF.Functions.Like(s.StationName, $"%{name}%"));
        }

        /* ====================================================================================== */
        public async Task<IEnumerable<WeatherData>> GetWeatherDataForStationAsync(int stationId, int limit = 10)
        {
            return await _context.WeatherData
                .Where(w => w.StationId == stationId)
                .OrderByDescending(w => w.Timestamp)
                .Take(limit)
                .ToListAsync();
        }

        /* ====================================================================================== */
        public async Task<WeatherData> GetLatestWeatherDataForStationAsync(int stationId)
        {
            return await _context.WeatherData
                .Where(w => w.StationId == stationId)
                .OrderByDescending(w => w.Timestamp)
                .FirstOrDefaultAsync();
        }

        /* ====================================================================================== */
        public async Task<IEnumerable<WeatherData>> GetHistoricalDataForStationAsync(int stationId, DateTime startDate, DateTime endDate)
        {
            return await _context.WeatherData
                .Where(w => w.StationId == stationId &&
                            w.Timestamp >= startDate &&
                            w.Timestamp <= endDate)
                .OrderByDescending(w => w.Timestamp)
                .ToListAsync();
        }

        /* ====================================================================================== */
        public async Task<Location> GetLocationByNameAsync(string name)
        {
            string normalizedName = name.Trim();

            // Strongest: exact match
            var exactMatch = await _context.Locations
                .FirstOrDefaultAsync(l => l.Woonplaats.ToLower() == normalizedName.ToLower());

            if (exactMatch != null)
            {
                return exactMatch;
            }

            // Second: starts with
            var startsWithMatch = await _context.Locations
                .FirstOrDefaultAsync(l => EF.Functions.Like(l.Woonplaats, $"{name}%"));

            if (startsWithMatch != null)
            {
                return startsWithMatch;
            }

            // Last try: contains
            return await _context.Locations
                .FirstOrDefaultAsync(l => EF.Functions.Like(l.Woonplaats, $"%{name}%"));

        }

        /* ====================================================================================== */
        public async Task<(Station station, WeatherData weatherData, Location location)> GetNearestStationToLocationAsync(string locationName)
        {
            var location = await GetLocationByNameAsync(locationName);
            if (location == null)
            {
                return (null, null, null);
            }

            var stations = await _context.Stations.ToListAsync();
            if (stations.Count == 0)
            {
                return (null, null, location);
            }

            Station nearestStation = null;
            double shortestDistance = double.MaxValue;

            foreach (var station in stations)
            {
                double distance = GeoUtils.Haversine(
                    location.Lat, location.Lon,
                    station.Lat, station.Lon
                );

                if (distance < shortestDistance)
                {
                    shortestDistance = distance;
                    nearestStation = station;
                }
            }

            if (nearestStation == null)
            {
                return (null, null, location);
            }

            var latestData = await GetLatestWeatherDataForStationAsync(nearestStation.StationId);
            return (nearestStation, latestData, location);
        }

        /* ====================================================================================== */
        public async Task<IEnumerable<Location>> GetAllLocationsAsync(int limit = 5000, int offset = 0)
        {
            return await _context.Locations
                    .OrderBy(l => l.Woonplaats)
                    .Skip(offset)
                    .Take(limit)
                    .ToListAsync();
        }
    }
}
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using WeatherService.API.Models;
using WeatherService.Services;
using WeatherService.Utils;

namespace WeatherService.API.Controllers
{
    [ApiController]
    [Route("api")]
    public class WeatherAPIController : ControllerBase
    {
        private readonly WeatherDataCoordinator _coordinator;
        private readonly ILogger<WeatherAPIController> _logger;
        private readonly IMapper _mapper;

        /* ========================================================================================== */
        public WeatherAPIController(
            WeatherDataCoordinator coordinator,
            ILogger<WeatherAPIController> logger,
            IMapper mapper)
        {
            _coordinator = coordinator;
            _logger = logger;
            _mapper = mapper;
        }

        /* ====================================================================================== */
        [HttpGet("nearest")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetNearestStation([FromQuery] string location)
        {
            if (string.IsNullOrWhiteSpace(location))
            {
                return BadRequest("Location parameter is required.");
            }

            var result = await _coordinator.GetNearestStationToLocationAsync(location);

            if (result.station == null)
            {
                return NotFound($"No location found matching '{location}' or no nearby stations available");
            }

            var dto = _mapper.Map<StationWithWeatherWithLocationDto>(result);

            if (result.location != null)
            {
                dto.LocationName = result.location.Woonplaats;
                dto.LocationLatitude = result.location.Lat;
                dto.LocationLongitude = result.location.Lon;
            }
            return Ok(dto);
        }

        /* ========================================================================================== */
        /// <summary>
        /// Gets all weather stations without their latest measurements
        /// </summary>
        /// <returns>A list of all weather stations</returns>
        [HttpGet("stations")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllStations()
        {
            try
            {
                var stationsWithData = await _coordinator.GetAllStationsWithLatestDataAsync();
                var stationsOnly = stationsWithData.Select(s => s.station);
                var result = _mapper.Map<List<StationDto>>(stationsOnly);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving stations");
                return StatusCode(500, "An error occurred while retrieving weather stations");
            }
        }

        /* ====================================================================================== */
        /// <summary>
        /// Gets all weather stations with their latest measurements
        /// </summary>
        /// <param name="stationName"></param>
        /// <returns>A list of all weather stations with their most recent data</returns>
        [HttpGet("stationsWithWeather")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllStationsWithWeather()
        {
            try
            {
                var stationsData = await _coordinator.GetAllStationsWithLatestDataAsync();
                var result = _mapper.Map<List<StationWithWeatherDto>>(stationsData);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving stations with weather");
                return StatusCode(500, "An error occurred while retrieving weather stations."); ;
            }
        }


        /* ========================================================================================== */
        [HttpGet("station/{stationName}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetStationByName(string stationName)
        {
            try
            {
                var stationData = await _coordinator.GetStationByNameAsync(stationName);

                if (stationData.station == null)
                {
                    return NotFound($"Station '{stationName}' not found");
                }

                // Map the tuple to StationWithWeatherDto
                var result = _mapper.Map<StationWithWeatherDto>(stationData);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving station '{stationName}'", stationName);
                return StatusCode(500, "An error occurred while retrieving the station");
            }
        }

        /* ====================================================================================== */
        [HttpGet("history/{stationId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetStationHistory(int stationId, [FromQuery] DateTime? start, [FromQuery] DateTime? end)
        {
            try
            {
                DateTime startDate = start ?? DateTime.Now.AddDays(-7);
                DateTime endDate = end ?? DateTime.Now;

                var historyData = await _coordinator.GetHistoricalDataForStationAsync(
                    stationId, startDate, endDate);

                // Map the collection of WeatherData to WeatherDataDto
                var result = _mapper.Map<List<WeatherDataDto>>(historyData);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving history for station '{stationId}'", stationId);
                return StatusCode(500, "An error occurred while retrieving the station history");
            }
        }

        /* ====================================================================================== */
        [HttpGet("locations")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllLocations([FromQuery] int limit = 5000, int offset = 0)
        {
            try
            {
                if (limit > 5000)
                {
                    limit = 5000;
                }

                var locations = await _coordinator.GetAllLocationsAsync(limit, offset);
                var result = _mapper.Map<List<LocationDto>>(locations);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving locations");
                return StatusCode(500, "An error occurred while retrieving locations");
            }
        }

    }
}
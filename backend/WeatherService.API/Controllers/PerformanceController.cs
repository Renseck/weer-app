using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using WeatherService.API.Services;

namespace WeatherService.API.Controllers
{
    [ApiController]
    [Route("api/performance")]
    public class PerformanceController : Controller
    {
        private readonly IRequestPerformanceService _performanceService;

        /* ====================================================================================== */
        public PerformanceController(IRequestPerformanceService performanceService)
        {
            _performanceService = performanceService;
        }

        /* ====================================================================================== */
        [HttpGet("stats")]
        public async Task<IActionResult> GetPerformanceStats()
        {
            var averageResponseTimes = await _performanceService.GetAverageResponseTimesByEndpointAsync();
            var requestCounts = await _performanceService.GetRequestCountByEndpointAsync();
            var successRates = await _performanceService.GetSuccessRateByEndpointAsync();

            return Ok(new
            {
                AverageResponseTimesByEndpoint = averageResponseTimes,
                RequestCountByEndpoint = requestCounts,
                SuccessRateByEndPoint = successRates
            });
        }

        /* ====================================================================================== */
        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs(
            [FromQuery] string path = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var logs = await _performanceService.GetRequestLogsAsync(path, startDate, endDate);
            return Ok(logs);
        }
        
    }
}
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WeatherService.API.Models;

namespace WeatherService.API.Services
{
    public interface IRequestPerformanceService
    {
        Task LogRequestAsync(RequestLog log);
        Task<List<RequestLog>> GetRequestLogsAsync(string path = null, DateTime? startDate = null, DateTime? endDate = null);
        Task<Dictionary<string, double>> GetAverageResponseTimesByEndpointAsync();
        Task<Dictionary<string, int>> GetRequestCountByEndpointAsync();
        Task<Dictionary<string, double>> GetSuccessRateByEndpointAsync();
    }
}
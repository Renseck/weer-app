using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using WeatherService.API.Models;
using WeatherService.Config;

namespace WeatherService.API.Services
{
    public class RequestPerformanceService : IRequestPerformanceService
    {
        private readonly string _logFilePath;
        private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

        /* ====================================================================================== */
        public RequestPerformanceService(IConfiguration configuration)
        {
            string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            string logDirectory = Path.Combine(baseDirectory, "logs");

            if (!Directory.Exists(logDirectory))
                Directory.CreateDirectory(logDirectory);

            _logFilePath = configuration["Logging:PerformanceLogPath"]
                ?? Path.Combine(logDirectory, "request_performance");

            AppConstants.Announce($"Request Performance logs will be saved to: {_logFilePath}", "info");

        }

        /* ====================================================================================== */
        public async Task LogRequestAsync(RequestLog log)
        {
            await _semaphore.WaitAsync();
            try
            {
                var logs = await ReadLogsAsync();
                logs.Add(log);
                await WriteLogsAsync(logs);
            }
            finally
            {
                _semaphore.Release();
            }
        }

        /* ====================================================================================== */
        public async Task<List<RequestLog>> GetRequestLogsAsync(string path = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var logs = await ReadLogsAsync();

            if (!string.IsNullOrEmpty(path))
                logs = logs.Where(l => l.Path.Contains(path)).ToList();

            if (startDate.HasValue)
                logs = logs.Where(l => l.Timestamp >= startDate.Value).ToList();

            if (endDate.HasValue)
                logs = logs.Where(l => l.Timestamp <= endDate.Value).ToList();

            return logs;
        }

        /* ====================================================================================== */
        public async Task<Dictionary<string, double>> GetAverageResponseTimesByEndpointAsync()
        {
            var logs = await ReadLogsAsync();
            var result = new Dictionary<string, double>();

            var groupedLogs = logs.GroupBy(l => NormalizeEndpointPath(l.Path));

            foreach (var group in groupedLogs)
            {
                var responseTimes = group.Select(l => l.ResponseTimeMs).ToList();

                if (responseTimes.Count <= 5)
                {
                    result[group.Key] = responseTimes.Average();
                }
                else
                {
                    var filteredTimes = RemoveOutliers(responseTimes);
                    result[group.Key] = filteredTimes.Average();
                }
            }

            return result;
        }

        /* ====================================================================================== */
        public async Task<Dictionary<string, int>> GetRequestCountByEndpointAsync()
        {
            var logs = await ReadLogsAsync();
            var result = new Dictionary<string, int>();

            // Group logs by normalized path
            var groupedLogs = logs.GroupBy(l => NormalizeEndpointPath(l.Path));

            foreach (var group in groupedLogs)
            {
                result[group.Key] = group.Count();
            }

            return result;
        }

        /* ====================================================================================== */
        public async Task<Dictionary<string, double>> GetSuccessRateByEndpointAsync()
        {
            var logs = await ReadLogsAsync();
            var result = new Dictionary<string, double>();

            // Group logs by normalized path
            var groupedLogs = logs.GroupBy(l => NormalizeEndpointPath(l.Path));

            foreach (var group in groupedLogs)
            {
                int totalRequests = group.Count();
                int successfulRequests = group.Count(l => l.IsSuccessful);
                result[group.Key] = successfulRequests * 100.0 / totalRequests;
            }

            return result;
        }

        /* ====================================================================================== */
        private async Task<List<RequestLog>> ReadLogsAsync()
        {
            if (!File.Exists(_logFilePath))
                return new List<RequestLog>();

            try
            {
                string json = await File.ReadAllTextAsync(_logFilePath);
                return JsonSerializer.Deserialize<List<RequestLog>>(json) ?? new List<RequestLog>();
            }
            catch (Exception ex)
            {
                AppConstants.Announce($"Error reading performance logs: {ex.Message}", "error");
                return new List<RequestLog>();
            }
        }

        /* ====================================================================================== */
        private async Task WriteLogsAsync(List<RequestLog> logs)
        {
            try
            {
                if (logs.Count > 10000)
                    logs = logs.OrderByDescending(l => l.Timestamp).Take(10000).ToList();

                string json = JsonSerializer.Serialize(logs, new JsonSerializerOptions
                {
                    WriteIndented = true
                });

                await File.WriteAllTextAsync(_logFilePath, json);
            }
            catch (Exception ex)
            {
                AppConstants.Announce($"Error writing performance logs: {ex.Message}", "error");
            }
        }

        /* ====================================================================================== */
        /*                                     Helper methods                                     */
        /* ====================================================================================== */
        /// <summary>
        /// This will replace numeric IDs in URL paths by regex
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        private static string NormalizeEndpointPath(string path)
        {
            if (path.Contains("/history/"))
            {
                return System.Text.RegularExpressions.Regex.Replace(
                    path,
                    @"/history/\d+",
                    "/history/{id}");
            }

            return path;
        }

        /* ====================================================================================== */
        /// <summary>
        /// Remove outliers by IQR
        /// </summary>
        /// <param name="values"></param>
        /// <returns>List of filtered numbers</returns>
        private static List<long> RemoveOutliers(List<long> values)
        {
            var sortedValues = values.OrderBy(v => v).ToList();

            int q1Index = (int)Math.Floor(sortedValues.Count * 0.25);
            long q1 = sortedValues[q1Index];

            int q3Index = (int)Math.Floor(sortedValues.Count * 0.75);
            long q3 = sortedValues[q1Index];

            long iqr = q3 - q1;

            long lowerBound = q1 - (long)(1.5 * iqr);
            long upperBound = q3 + (long)(1.5 * iqr);

            return [.. values.Where(v => v >= lowerBound && v <= upperBound)];
        }
    }
}
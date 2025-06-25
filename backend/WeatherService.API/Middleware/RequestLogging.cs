using System.Diagnostics;
using WeatherService.Config;
using WeatherService.API.Models;
using WeatherService.API.Services;

namespace WeatherService.API.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IRequestPerformanceService _performanceService;

        public RequestLoggingMiddleware(
            RequestDelegate next,
            IRequestPerformanceService performanceService)
        {
            _next = next;
            _performanceService = performanceService;
        }

        /* ====================================================================================== */
        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            var requestPath = context.Request.Path;
            var method = context.Request.Method;

            AppConstants.Announce($"Request {method} {requestPath}", "info");

            try
            {
                await _next(context);
                stopwatch.Stop();

                var statusCode = context.Response.StatusCode;
                var elapsedMs = stopwatch.ElapsedMilliseconds;

                string responseType = statusCode >= 400 ? "warning" : "success";
                AppConstants.Announce($"Response {statusCode} for {method} {requestPath} completed in {elapsedMs}ms", responseType);

                await _performanceService.LogRequestAsync(new RequestLog
                {
                    Timestamp = DateTime.UtcNow,
                    Method = method,
                    Path = requestPath,
                    StatusCode = statusCode,
                    ResponseTimeMs = elapsedMs
                });
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                AppConstants.Announce($"Error processing {method} {requestPath}: {ex.Message}", "error");

                await _performanceService.LogRequestAsync(new RequestLog
                {
                    Timestamp = DateTime.UtcNow,
                    Method = method,
                    Path = requestPath,
                    StatusCode = 500,
                    ResponseTimeMs = stopwatch.ElapsedMilliseconds
                });

                throw;
            }
        }
    }

    /* ========================================================================================== */
    public static class RequestLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RequestLoggingMiddleware>();
        }
    }
}
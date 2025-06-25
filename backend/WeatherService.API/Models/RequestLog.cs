using System;

namespace WeatherService.API.Models
{
    public class RequestLog
    {
        public DateTime Timestamp { get; set; }
        public string Method { get; set; }
        public string Path { get; set; }
        public int StatusCode { get; set; }
        public long ResponseTimeMs { get; set; }
        public bool IsSuccessful => StatusCode >= 200 & StatusCode < 400;
    }
}
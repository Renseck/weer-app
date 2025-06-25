namespace WeatherService.API.Models
{
    public class StationDto
    {
        public int StationId { get; set; }
        public required string StationName { get; set; }
        public decimal Lat { get; set; }
        public decimal Lon { get; set; }
        public required string Regio { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    /* ========================================================================================== */
    public class WeatherDataDto
    {
        public int Id { get; set; }
        public int StationId { get; set; }
        public required string WeatherDescription { get; set; }
        public double AirPressure { get; set; }
        public required string WindDirection { get; set; }
        public decimal WindDirectionDegrees { get; set; }
        public decimal Temperature { get; set; }
        public decimal GroundTemperature { get; set; }
        public decimal FeelTemperature { get; set; }
        public decimal Humidity { get; set; }
        public decimal WindSpeed { get; set; }
        public decimal WindSpeedBft { get; set; }
        public decimal RainfallLastHour { get; set; }
        public decimal SunPower { get; set; }
        public DateTime Timestamp { get; set; }
    }

    /* ========================================================================================== */
    public class StationWithWeatherDto
    {
        public int Id { get; set; }
        public int StationId { get; set; }
        public required string StationName { get; set; }
        public decimal Lat { get; set; }
        public decimal Lon { get; set; }
        public required string Regio { get; set; }
        public required string WeatherDescription { get; set; }
        public double AirPressure { get; set; }
        public required string WindDirection { get; set; }
        public decimal WindDirectionDegrees { get; set; }
        public decimal Temperature { get; set; }
        public decimal GroundTemperature { get; set; }
        public decimal FeelTemperature { get; set; }
        public decimal Humidity { get; set; }
        public decimal WindSpeed { get; set; }
        public decimal WindSpeedBft { get; set; }
        public decimal RainfallLastHour { get; set; }
        public decimal SunPower { get; set; }
        // General stuff
        public DateTime Timestamp { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    /* ========================================================================================== */
    public class StationWithWeatherWithLocationDto : StationWithWeatherDto
    {
        // Location properties
        public string LocationName { get; set; }
        public decimal LocationLatitude { get; set; }
        public decimal LocationLongitude { get; set; }
    }

    /* ========================================================================================== */
    public class LocationDto
    {
        public string Postcode { get; set; }
        public string Woonplaats { get; set; }
        public string Gemeente { get; set; }
    }
}
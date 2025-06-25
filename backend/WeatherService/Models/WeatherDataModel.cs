namespace WeatherService.Models
{
    public class BuienradarResponse
    {
        public Actual? Actual { get; set; }
    }

    /* ========================================================================================== */
    public class Actual
    {
        public List<WeatherRecord>? StationMeasurements { get; set; }
    }

    /* ========================================================================================== */
    // This class is used only for deserializing the API response -- it'll be split into constituents below
    public class WeatherRecord
    {
        public int Id { get; set; }
        public int StationId { get; set; }
        public required string StationName { get; set; }
        public decimal Lat { get; set; }
        public decimal Lon { get; set; }
        public required string Regio { get; set; }
        public required string WeatherDescription { get; set; }
        public double AirPressure { get; set; }
        public string WindDirection { get; set; } = "null";
        public decimal WindDirectionDegrees { get; set; }
        public decimal Temperature { get; set; } = -999m;
        public decimal GroundTemperature { get; set; } = -999m;
        public decimal FeelTemperature { get; set; } = -999m;
        public decimal Humidity { get; set; }
        public decimal WindSpeed { get; set; }
        public decimal WindSpeedBft { get; set; }

        public decimal RainfallLastHour { get; set; }
        public decimal SunPower { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;

    }

    /* ========================================================================================== */
    // Station table
    public class Station
    {
        public int StationId { get; set; } // Primary Key
        public required string StationName { get; set; }
        public decimal Lat { get; set; }
        public decimal Lon { get; set; }
        public required string Regio { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.Now;

        // Navigation property
        public ICollection<WeatherData> WeatherData { get; set; } = new List<WeatherData>();
    }


    /* ========================================================================================== */
    // WeatherData table
    public class WeatherData
    {
        public int Id { get; set; }
        public int StationId { get; set; }
        public required string WeatherDescription { get; set; }
        public double AirPressure { get; set; }
        public required string WindDirection { get; set; } = "null";
        public decimal WindDirectionDegrees { get; set; }
        public decimal Temperature { get; set; } = -999m;
        public decimal GroundTemperature { get; set; } = -999m;
        public decimal FeelTemperature { get; set; } = -999m;
        public decimal Humidity { get; set; }
        public decimal WindSpeed { get; set; }
        public decimal WindSpeedBft { get; set; }

        public decimal RainfallLastHour { get; set; }
        public decimal SunPower { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;

        // Navigation property
        public Station? Station { get; set; }
    }
}
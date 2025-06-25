using Microsoft.Extensions.Configuration;

namespace WeatherService.Config
{
    public class SchedulingConfig
    {
        public int IntervalMinutes { get; set; } = 10;
        public int StartMinute { get; set; } = 5;
        public bool RunImmediately { get; set; } = true;

        /* ====================================================================================== */
        public static SchedulingConfig FromConfiguration(IConfiguration configuration)
        {
            var config = new SchedulingConfig();

            var schedulingSection = configuration.GetSection("Scheduling");
            if (schedulingSection.Exists())
            {
                schedulingSection.Bind(config);
            }

            // Validate configuration values
            if (config.IntervalMinutes <= 0 || config.IntervalMinutes > 60)
            {
                config.IntervalMinutes = 10; // Default to 10 minutes if invalid
            }

            if (config.StartMinute < 0 || config.StartMinute >= 60)
            {
                config.StartMinute = 5; // Default to 5 minutes if invalid
            }

            return config;
        }

        /* ====================================================================================== */
        public string ToCronExpression()
        {
            if (IntervalMinutes == 60)
            {
                return $"0 {StartMinute} * ? * *";
            }
            else if (60 % IntervalMinutes == 0)
            {
                return $"0 {StartMinute}/{IntervalMinutes} * ? * *";
            }
            else
            {
                var minutes = new List<int>();
                for (int i = StartMinute; i < 60; i += IntervalMinutes)
                {
                    minutes.Add(i);
                }
                return $"0 {string.Join(",", minutes)}";
            }
        }

        /* ====================================================================================== */
        public string GetDescription()
        {
            if (IntervalMinutes == 60)
            {
                return $"hourly at {StartMinute} minutes past the hour";
            }
            else if (60 % IntervalMinutes == 0)
            {
                var times = new List<int>();
                for (int i = StartMinute; i < 60; i += IntervalMinutes)
                {
                    times.Add(i);
                }
                return $"every {IntervalMinutes} minutes (at {string.Join(", ", times)} minutes past the hour)";
            }
            else
            {
                var times = new List<int>();
                for (int i = StartMinute; i < 60; i += IntervalMinutes)
                {
                    times.Add(i);
                }
                return $"at the following minutes of each hour: {string.Join(", ", times)}";
            }
        }
    }
}
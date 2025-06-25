using System;

namespace WeatherService.Config
{
    /// <summary>
    /// Provides application-wide constants and utility methods
    /// </summary>
    public static class AppConstants
    {
        public const string ProjectName = "WeatherService";

        // ANSI color escape codes
        private const string Reset = "\u001b[0m";
        private const string Red = "\u001b[31m";
        private const string White = "\u001b[37m";
        private const string Yellow = "\u001b[33m";
        private const string Green = "\u001b[32m";


        /* ====================================================================================== */
        /// <summary>
        /// Shorthand method for announcing the working of a module of an application
        /// </summary>
        /// <param name="message">The message to show</param>
        /// <param name="type">The type of message it is (info, success, warning, error)</param>
        public static void Announce(string message, string type = "info")
        {
            string color = type.ToLower() switch
            {
                "error" => Red,
                "warning" => Yellow,
                "success" => Green,
                "info" => White,
                _ => White
            };

            string prefix = type.ToLower() switch
            {
                "error" => "[ERROR] ",
                "warning" => "[WARNING] ",
                "success" => "[SUCCESS] ",
                "info" => "",
                _ => ""
            };

            string time = DateTime.Now.ToString("HH:mm:ss");

            Console.WriteLine($"[{time}] {color}[{ProjectName}] {prefix}{message}{Reset}");
        }

        /* ======================== Shorthands version of above subtypes ======================== */
        public static void Info(string message) => Announce(message, "info");
        public static void Success(string message) => Announce(message, "success");
        public static void Warning(string message) => Announce(message, "warning");
        public static void Error(string message) => Announce(message, "error");
    }
}
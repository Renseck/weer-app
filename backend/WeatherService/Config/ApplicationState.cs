namespace WeatherService.Config
{
    public static class ApplicationState
    {
        private static bool _isRunning = true;
        private static readonly object _lock = new object();

        /* ====================================================================================== */
        public static bool IsRunning
        {
            get
            {
                lock (_lock) { return _isRunning; }
            }
        }

        /* ====================================================================================== */
        public static void RequestShutdown()
        {
            lock(_lock) { _isRunning = false; }
            AppConstants.Announce("Application shutdown requested", "warning");
        }
    }
}
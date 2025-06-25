using System;

namespace WeatherService.Utils
{
    public static class GeoUtils
{
    private const double EarthRadiusKm = 6371;

    /* ====================================================================================== */
    public static double CalculateDistance(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
    {
        double sdLat = Math.Sin(ToRadians(Convert.ToDouble(lat2 - lat1)) / 2);
        double sdLon = Math.Sin(ToRadians(Convert.ToDouble(lon2 - lon1)) / 2);

        var q = sdLat * sdLat + Math.Cos(ToRadians(Convert.ToDouble(lat1))) * Math.Cos(ToRadians(Convert.ToDouble(lat2))) * sdLon * sdLon;
        return 2 * EarthRadiusKm * Math.Asin(Math.Sqrt(q));
    }

    /* ====================================================================================== */
    public static double Haversine(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
    {
        double dLat = ToRadians(Convert.ToDouble(lat2) - Convert.ToDouble(lat1));
        double dLon = ToRadians(Convert.ToDouble(lon2) - Convert.ToDouble(lon1));

        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
            Math.Cos(ToRadians(Convert.ToDouble(lat1))) * Math.Cos(ToRadians(Convert.ToDouble(lat2))) *
            Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        double c = 2 * Math.Asin(Math.Min(1, Math.Sqrt(a)));
        double d = EarthRadiusKm * c;
        return d;

    }
    /* ========================================================================================== */
    private static double ToRadians(double degrees)
    {
        return degrees * (Math.PI / 180);
    }
}
}
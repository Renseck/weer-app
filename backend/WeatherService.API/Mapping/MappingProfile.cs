using AutoMapper;
using WeatherService.API.Models;
using WeatherService.Models;

namespace WeatherService.API.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Station, StationDto>()
                .ForMember(dest => dest.Lat, opt => opt.MapFrom(src => src.Lat))
                .ForMember(dest => dest.Lon, opt => opt.MapFrom(src => src.Lon))
                .ForMember(dest => dest.Regio, opt => opt.MapFrom(src => src.Regio));

            CreateMap<WeatherData, WeatherDataDto>();

            CreateMap<(Station station, WeatherData weatherData), StationWithWeatherDto>()
                // Map station properties
                .ForMember(dest => dest.StationId, opt => opt.MapFrom(src => src.station.StationId))
                .ForMember(dest => dest.StationName, opt => opt.MapFrom(src => src.station.StationName))
                .ForMember(dest => dest.Lat, opt => opt.MapFrom(src => src.station.Lat))
                .ForMember(dest => dest.Lon, opt => opt.MapFrom(src => src.station.Lon))
                .ForMember(dest => dest.Regio, opt => opt.MapFrom(src => src.station.Regio))
                .ForMember(dest => dest.LastUpdated, opt => opt.MapFrom(src => src.station.LastUpdated))

                // Map weather properties
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.weatherData.Id))
                .ForMember(dest => dest.WeatherDescription, opt => opt.MapFrom(src => src.weatherData.WeatherDescription))
                .ForMember(dest => dest.AirPressure, opt => opt.MapFrom(src => src.weatherData.AirPressure))
                .ForMember(dest => dest.WindDirection, opt => opt.MapFrom(src => src.weatherData.WindDirection))
                .ForMember(dest => dest.WindDirectionDegrees, opt => opt.MapFrom(src => src.weatherData.WindDirectionDegrees))
                .ForMember(dest => dest.Temperature, opt => opt.MapFrom(src => src.weatherData.Temperature))
                .ForMember(dest => dest.GroundTemperature, opt => opt.MapFrom(src => src.weatherData.GroundTemperature))
                .ForMember(dest => dest.FeelTemperature, opt => opt.MapFrom(src => src.weatherData.FeelTemperature))
                .ForMember(dest => dest.Humidity, opt => opt.MapFrom(src => src.weatherData.Humidity))
                .ForMember(dest => dest.WindSpeed, opt => opt.MapFrom(src => src.weatherData.WindSpeed))
                .ForMember(dest => dest.WindSpeedBft, opt => opt.MapFrom(src => src.weatherData.WindSpeedBft))
                .ForMember(dest => dest.RainfallLastHour, opt => opt.MapFrom(src => src.weatherData.RainfallLastHour))
                .ForMember(dest => dest.SunPower, opt => opt.MapFrom(src => src.weatherData.SunPower))
                .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => src.weatherData.Timestamp));

            CreateMap<(Station station, WeatherData weatherData, Location location), StationWithWeatherWithLocationDto>()
                // Map station properties
                .ForMember(dest => dest.StationId, opt => opt.MapFrom(src => src.station.StationId))
                .ForMember(dest => dest.StationName, opt => opt.MapFrom(src => src.station.StationName))
                .ForMember(dest => dest.Lat, opt => opt.MapFrom(src => src.station.Lat))
                .ForMember(dest => dest.Lon, opt => opt.MapFrom(src => src.station.Lon))
                .ForMember(dest => dest.Regio, opt => opt.MapFrom(src => src.station.Regio))
                .ForMember(dest => dest.LastUpdated, opt => opt.MapFrom(src => src.station.LastUpdated))

                // Map weather properties
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.weatherData.Id))
                .ForMember(dest => dest.WeatherDescription, opt => opt.MapFrom(src => src.weatherData.WeatherDescription))
                .ForMember(dest => dest.AirPressure, opt => opt.MapFrom(src => src.weatherData.AirPressure))
                .ForMember(dest => dest.WindDirection, opt => opt.MapFrom(src => src.weatherData.WindDirection))
                .ForMember(dest => dest.WindDirectionDegrees, opt => opt.MapFrom(src => src.weatherData.WindDirectionDegrees))
                .ForMember(dest => dest.Temperature, opt => opt.MapFrom(src => src.weatherData.Temperature))
                .ForMember(dest => dest.GroundTemperature, opt => opt.MapFrom(src => src.weatherData.GroundTemperature))
                .ForMember(dest => dest.FeelTemperature, opt => opt.MapFrom(src => src.weatherData.FeelTemperature))
                .ForMember(dest => dest.Humidity, opt => opt.MapFrom(src => src.weatherData.Humidity))
                .ForMember(dest => dest.WindSpeed, opt => opt.MapFrom(src => src.weatherData.WindSpeed))
                .ForMember(dest => dest.WindSpeedBft, opt => opt.MapFrom(src => src.weatherData.WindSpeedBft))
                .ForMember(dest => dest.RainfallLastHour, opt => opt.MapFrom(src => src.weatherData.RainfallLastHour))
                .ForMember(dest => dest.SunPower, opt => opt.MapFrom(src => src.weatherData.SunPower))
                .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => src.weatherData.Timestamp))

                // Map location data
                .ForMember(dest => dest.LocationName, opt => opt.MapFrom(src => src.location.Woonplaats))
                .ForMember(dest => dest.LocationLatitude, opt => opt.MapFrom(src => src.location.Lat))
                .ForMember(dest => dest.LocationLongitude, opt => opt.MapFrom(src => src.location.Lon));

            CreateMap<Location, LocationDto>();
        }
    }
}
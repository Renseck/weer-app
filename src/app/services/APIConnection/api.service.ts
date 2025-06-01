import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { MeteoService } from '../MeteoService/meteo.service';
import { StationData, WeatherData } from '../WeatherDataJson/weather-data.service';
import { LoggingConfig } from '../../config/logging-config';
import { CachingService } from '../CachingService/caching.service';

export interface LocationData {
  postcode: string;
  woonplaats: string;
  gemeente: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = "http://localhost:5216";
  private location = "arnhem";

  constructor(
    private http: HttpClient,
    private meteoService: MeteoService,
    private cachingService: CachingService) { }

  /* ============================================================================================ */
  getData(location?: string): Observable<WeatherData> {
    const targetLocation = location || this.location;

    // Check cache first
    const cachedData = this.cachingService.getWeatherData(targetLocation);
    if (cachedData) {
      if (LoggingConfig.apiLogging)
      {
        console.log(`Using cached weather data for ${targetLocation}`);
      }

      return new Observable<WeatherData>(observer => {
        observer.next(cachedData);
        observer.complete();
      });
    }

    // Poll API otherwise
    return this.http.get<any>(`${this.baseUrl}/api/nearest?location=${targetLocation}`)
            .pipe(
              tap(rawData => console.log('Raw API wind speed:', rawData.windSpeed)),
              map(data => this.meteoService.processWeatherData(data)),
              tap(processedData => {
                this.cachingService.setWeatherData(targetLocation, processedData);
                // console.log(`Cached weather data for ${targetLocation}`);
              })
            );
  }

  /* ============================================================================================ */
  /** 
   * Works in tandem with getData to deal with searches in a natural feeling way
   */
  setLocation(location: string): void {
    this.location = location.toLowerCase().trim();
  }

  /* ============================================================================================ */
  /** 
   * Get all available locations on page load for search suggestions
   */
  getAllLocations() : Observable<LocationData[]> {
    // Check cache first
    const cachedLocations = this.cachingService.getLocationsData();
    if (cachedLocations) {
      if (LoggingConfig.apiLogging)
      { 
        console.log("Using cached locations data");
      }

      return new Observable<LocationData[]>(observer => {
        observer.next(cachedLocations);
        observer.complete();
      });
    }

    // Fetch from API otherwise
    return this.http.get<LocationData[]>(`${this.baseUrl}/api/locations`).pipe(
      tap(locations => {
        this.cachingService.setLocationsData(locations);
        
        if (LoggingConfig.apiLogging)
        {
          console.log(`Cached ${locations.length} locations`);
        }
      })
    );
  }

  /* ============================================================================================ */
  getStationHistory(stationId: number): Observable<WeatherData[]> {
    if (!stationId) {
      console.error("Cannot fetch history: no station ID given");
      return new Observable<WeatherData[]>(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    // Check cache first
    const cachedHistory = this.cachingService.getHistoryData(stationId);
    if (cachedHistory) {
      if (LoggingConfig.apiLogging)
      {
        console.log(`Using cached history for station ${stationId} (${cachedHistory.length} records)`);
      }

      return new Observable<WeatherData[]>(observer => {
        observer.next(cachedHistory);
        observer.complete();
      })
    }

    return this.http.get<WeatherData[]>(`${this.baseUrl}/api/history/${stationId}`)
      .pipe(
        map(historyData => {
          return historyData.map(item => this.meteoService.processWeatherData(item));
        }),
        tap(processedData => {
          this.cachingService.setHistoryData(stationId, processedData);

          if (LoggingConfig.apiLogging)
          {
            console.log(`Cached ${processedData.length} history records for station ${stationId}`);
          }
        })
      );
  }

  /* ============================================================================================ */
  getAllStationsWithWeather(): Observable<StationData[]> {
    const cachedStations = this.cachingService.getStationsData();
    if (cachedStations) {
      if (LoggingConfig.apiLogging)
      {
        console.log("Using cached stations weather data");
      }

      return new Observable<StationData[]>(observer => {
        observer.next(cachedStations);
        observer.complete();
      });
    }

    return this.http.get<StationData[]>(`${this.baseUrl}/api/stationsWithWeather`).pipe(
      map(stations => stations.map(station => this.meteoService.processWeatherData(station))),
      tap(stations => {
        this.cachingService.setStationsData(stations);

        if (LoggingConfig.apiLogging)
        {
          console.log(`Cached weather data for ${stations.length} stations`);
        }
      })
    );
  }
}

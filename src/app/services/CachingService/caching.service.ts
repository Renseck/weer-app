import { Injectable } from '@angular/core';
import { StationData, WeatherData } from '../WeatherDataJson/weather-data.service';
import { LocationData } from '../APIConnection/api.service';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheConfig {
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class CachingService {
  private readonly LOCATIONS_PREFIX = 'locations_';
  private readonly WEATHER_PREFIX = 'weather_';
  private readonly HISTORY_PREFIX = 'history_';
  private readonly STATIONS_PREFIX = 'stations_';

  private defaultCacheDuration: number = 10 * 60 * 1000; // Standard is 10 minutes

  // Type-specific durations
  private cacheConfigs: Record<string, CacheConfig> = {
    'locations': { duration: 60 * 60 * 1000 },
    'weather': { duration: this.defaultCacheDuration},
    'history': { duration: this.defaultCacheDuration},
    'stations': { duration: this.defaultCacheDuration}
  };

  private cache: Map<string, CacheEntry<any>> = new Map();

  /* ============================================================================================ */
  constructor() { }

  /* ============================================================================================ */
  /*                                     Generic cache methods                                    */
  /* ============================================================================================ */
  set<T>(key: string, data: T, cacheType?: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /* ============================================================================================ */
  get<T>(key: string, cacheType?: string): T | null {
    if (!this.has(key, cacheType)) {
      return null;
    }

    const entry = this.cache.get(key)!;
    return entry.data as T;
  }

  /* ============================================================================================ */
  has(key: string, cacheType?: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const duration = cacheType ? 
      this.cacheConfigs[cacheType]?.duration || this.defaultCacheDuration : 
      this.defaultCacheDuration;

    return !this.isExpired(entry.timestamp, duration);
  }

  /* ============================================================================================ */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /* ============================================================================================ */
  clear(): void {
    this.cache.clear();
  }

  /* ============================================================================================ */
  setCacheDuration(durationMs: number, cacheType?: string): void {
    if (durationMs <= 0) return;

    if (cacheType) {
      if (!this.cacheConfigs[cacheType]) {
        this.cacheConfigs[cacheType] = { duration: durationMs };
      }
      else
      {
        this.cacheConfigs[cacheType].duration = durationMs;
      }
    }
    else
    {
      this.defaultCacheDuration = durationMs;
    }
  }

  /* ============================================================================================ */
  /*                                  Type-specific cache methods                                 */
  /* ============================================================================================ */

  /* =================================== Weather cache methods ================================== */
  setWeatherData(location: string, data: WeatherData): void {
    const key = `${this.WEATHER_PREFIX}${location.toLowerCase()}`;
    this.set(key, data, 'weather');
  }

  getWeatherData(location: string): WeatherData | null {
    const key = `${this.WEATHER_PREFIX}${location.toLowerCase()}`;
    return this.get<WeatherData>(key, 'weather');
  }

  clearWeatherData() {
    for (const key of this.cache.keys()) {
      if (key.startsWith(this.WEATHER_PREFIX)) {
        this.cache.delete(key);
      }
    }
  }

  /* ================================== Location cache methods ================================== */
  setLocationsData(data: LocationData[]): void {
    const key = `${this.LOCATIONS_PREFIX}all`;
    this.set(key, data, 'locations');
  }

  getLocationsData(): LocationData[] | null {
    const key = `${this.LOCATIONS_PREFIX}all`;
    return this.get<LocationData[]>(key, 'locations');
  }

  /* =================================== History cache methods ================================== */
  setHistoryData(stationId: number, data: WeatherData[]): void {
    const key = `${this.HISTORY_PREFIX}${stationId}`;
    this.set(key, data, 'history');
  }
  
  getHistoryData(stationId: number): WeatherData[] | null {
    const key = `${this.HISTORY_PREFIX}${stationId}`;
    return this.get<WeatherData[]>(key, 'history');
  }
  
  clearHistoryCache(stationId?: number): void {
    if (stationId) {
      // Clear just one station
      this.remove(`${this.HISTORY_PREFIX}${stationId}`);
    } else {
      // Clear all history entries
      for (const key of this.cache.keys()) {
        if (key.startsWith(this.HISTORY_PREFIX)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /* ================================== Stations cache methods ================================== */
  setStationsData(data: any[]) : void {
    const key = `${this.STATIONS_PREFIX}all`;
    this.set(key, data, 'stations');
  }

  getStationsData(): StationData[] | null {
    const key = `${this.STATIONS_PREFIX}all`;
    return this.get<StationData[]>(key, 'stations');
  }

  clearStationsData(): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(this.STATIONS_PREFIX)) {
        this.cache.delete(key);
      }
    }
  }

  /* ============================================================================================ */
  private isExpired(timestamp: number, duration: number): boolean {
    return Date.now() - timestamp > duration;
;
  }
}

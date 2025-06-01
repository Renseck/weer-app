import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StationData {
  stationId: number;
  stationName: string;
  temperature: number;
  humidity: number;
  feelTemperature: number;
  groundTemperature: number;
  sunPower: number;
  rainfallLastHour: number;
  windSpeed: number;
  windDirectionDegrees: number;
  timestamp: string;
  lat: number;
  lon: number;
}

export interface WeatherData extends StationData {
  locationName?: string;
  locationLatitude: number;
  locationLongitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherDataService {
  constructor(private http: HttpClient) { }

  getData(): Observable<WeatherData> {
    return this.http.get<WeatherData>('assets/weather-data.json');
  }
}

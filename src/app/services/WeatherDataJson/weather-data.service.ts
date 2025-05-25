import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeatherData {
  temperature: number;
  feelTemperature: number;
  groundTemperature: number;
  sunPower: number;
  rainfallLastHour: number;
  windDirectionDegrees: number;
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

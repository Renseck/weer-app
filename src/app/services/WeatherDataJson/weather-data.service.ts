import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeatherData {
  actualTemp: number;
  feelTemp: number;
  groundTemp: number;
  solarPower: number;
  rainValue: number;
  windDirectionDegrees: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherDataService {
  constructor(private http: HttpClient) { }

  getWeatherData(): Observable<WeatherData> {
    return this.http.get<WeatherData>('assets/weather-data.json');
  }
}

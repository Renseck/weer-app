import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ActualTempIconComponent } from '../icons/actual-temp-icon/actual-temp-icon.component';
import { PerceivedTempIconComponent } from '../icons/perceived-temp-icon/perceived-temp-icon.component';
import { GroundTempIconComponent } from '../icons/ground-temp-icon/ground-temp-icon.component';
import { RainIconComponent } from '../icons/rain-icon/rain-icon.component';
import { SunIconComponent } from '../icons/sun-icon/sun-icon.component';
import { WindCompassIconComponent } from '../icons/wind-compass-icon/wind-compass-icon.component';
import { WeatherDataService } from '../../services/WeatherDataJson/weather-data.service';
import { ApiService } from '../../services/APIConnection/api.service';

@Component({
  selector: 'app-weather',
  imports: [
    CommonModule,
    SearchBarComponent,
    ActualTempIconComponent,
    PerceivedTempIconComponent,
    GroundTempIconComponent,
    RainIconComponent,
    SunIconComponent,
    WindCompassIconComponent
  ],
  templateUrl: './weather-display.component.html',
  styleUrl: './weather-display.component.css'
})
export class WeatherComponent implements OnInit {
  actualTemp: number = 0;
  feelTemp: number = 0;
  groundTemp: number = 0;
  solarPower: number = 0;
  rainValue: number = 0;
  windDirectionDegrees: number = 0;

  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private weatherService: WeatherDataService,
    private apiService: ApiService) {}

  ngOnInit(): void {
      this.loadWeatherData();
  }

  loadWeatherData() {
    this.isLoading = true;
    
    this.weatherService.getData().subscribe({
      next: (data) => {
        // Simulate loading delay to see the effect
        setTimeout(() => {
          this.actualTemp = data.temperature;
          this.feelTemp = data.feelTemperature;
          this.groundTemp = data.groundTemperature;
          this.solarPower = data.sunPower;
          this.rainValue = data.rainfallLastHour;
          this.windDirectionDegrees = data.windDirectionDegrees;
          this.isLoading = false;
        }, 1000);
      },
      error: (err) => {
        console.error('Error loading weather data from API:', err);
        this.errorMessage = 'Failed to load weather data from API';
        this.isLoading = false;
      }
    });
  }

  onCitySearch(city: string) {
    console.log('Searching for city:', city);
  }

  ngAfterViewInit() {
    console.log('Current values:', {
      actualTemp: this.actualTemp,
      perceivedTemp: this.feelTemp,
      groundTemp: this.groundTemp
    });
  }
}

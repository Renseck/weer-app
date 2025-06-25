import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import localeNl from '@angular/common/locales/nl';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ActualTempIconComponent } from '../icons/actual-temp-icon/actual-temp-icon.component';
import { PerceivedTempIconComponent } from '../icons/perceived-temp-icon/perceived-temp-icon.component';
import { GroundTempIconComponent } from '../icons/ground-temp-icon/ground-temp-icon.component';
import { RainIconComponent } from '../icons/rain-icon/rain-icon.component';
import { SunIconComponent } from '../icons/sun-icon/sun-icon.component';
import { WindCompassIconComponent } from '../icons/wind-compass-icon/wind-compass-icon.component';
import { FloatingNotificationComponent } from '../floating-notification/floating-notification.component';
import { FooterComponent } from '../footer/footer.component';
import { ApiService } from '../../services/APIConnection/api.service';
import { ModalService } from '../../services/ModalService/modal.service';
import { WeatherMapComponent } from '../weather-map/weather-map.component'; 

registerLocaleData(localeNl);

@Component({
  selector: 'app-weather',
  imports: [
    CommonModule,
    FloatingNotificationComponent,
    SearchBarComponent,
    ActualTempIconComponent,
    PerceivedTempIconComponent,
    GroundTempIconComponent,
    RainIconComponent,
    SunIconComponent,
    WindCompassIconComponent,
    FooterComponent,
    WeatherMapComponent
  ],
  templateUrl: './weather-display.component.html',
  styleUrl: './weather-display.component.css',
  animations: [
    trigger('slideToggle', [
      state('closed', style({
        height: '0',
        overflow: 'hidden',
        opacity: '0'
      })),
      state('open', style({
        height: '*',
        opacity: '1'
      })),
      transition('closed <=> open', animate('300ms ease-in-out'))
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class WeatherComponent implements OnInit {
  stationId: number = 0;
  stationName: string = '';
  actualTemp: number = 0;
  feelTemp: number = 0;
  groundTemp: number = 0;
  solarPower: number = 0;
  rainValue: number = 0;
  windSpeed: number = 0;
  windDirectionDegrees: number = 0;
  timestamp: string = '';
  lat: number = 0;
  lon: number = 0;
  
  locationName: string = '';
  locationLat: number = 0;
  locationLon: number = 0;

  isLoading: boolean = true;
  errorMessage: string | null = null;
  searchTerm: string = 'Arnhem';
  displayedCity: string = '';
  showMap: boolean = false;

  private isFromSuggestion: boolean = false;
  public pullTabWiggle: boolean = false;

  /* ============================================================================================ */
  constructor(private apiService: ApiService, private modalService: ModalService) {}

  /* ============================================================================================ */
  ngOnInit(): void {
      this.isFromSuggestion = false;
      this.loadWeatherData();
  }

  /* ============================================================================================ */
  loadWeatherData() {
    this.isLoading = true;
    
    this.apiService.getData().subscribe({
      next: (data) => {
        // Simulate loading delay to see the effect
        if (!this.isFromSuggestion && data.locationName) {
          this.displayedCity = this.capitalize(data.locationName);
        }

        setTimeout(() => {
          this.stationId = data.stationId;
          this.stationName = data.stationName;
          this.actualTemp = data.temperature;
          this.feelTemp = data.feelTemperature;
          this.groundTemp = data.groundTemperature;
          this.solarPower = data.sunPower;
          this.rainValue = data.rainfallLastHour;
          this.windSpeed = data.windSpeed;
          this.windDirectionDegrees = data.windDirectionDegrees;
          this.timestamp = data.timestamp;
          this.lat = data.lat;
          this.lon = data.lon;

          this.locationName = data.locationName ?? '';
          this.locationLat = data.locationLatitude;
          this.locationLon = data.locationLongitude;

          this.isLoading = false;

          this.pullTabWiggle = false;
          setTimeout(() => this.pullTabWiggle = true, 200); // small delay to ensure class is applied
          setTimeout(() => this.pullTabWiggle = false, 1200); // remove after animation
        }, 250);

        console.log("displayed city:", this.displayedCity);
      },
      error: (err) => {
        console.error('Error loading weather data from API:', err);
        this.errorMessage = 'Failed to load weather data from API';
        this.isLoading = false;
      }
    });
  }

  /* ============================================================================================ */
  onCitySearch(searchData: {term: string, cityName?: string}) {
    console.log('Searching for city:', searchData.term);
    this.searchTerm = searchData.term;

    this.isFromSuggestion = !!searchData.cityName;

    if (searchData.cityName) {
    this.displayedCity = searchData.cityName;
    } 
    else 
    {
      this.displayedCity = this.capitalize(searchData.term);
    }
    
    this.errorMessage = null;
    this.apiService.setLocation(searchData.term);
    this.loadWeatherData();
  }

  /* ============================================================================================ */
  refreshWeatherData() {
    console.log("Refreshing weather data...");
    this.isFromSuggestion = false;
    this.errorMessage = null;
    this.loadWeatherData();
  }

  /* ============================================================================================ */
  formatTimeStamp(timestamp: string): string {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const datePipe = new DatePipe("nl");
    return datePipe.transform(date, 'dd MMM yyyy HH:mm:ss') || '';
  }

  /* ============================================================================================ */
  lowercaseFirst(str: string): string {
    if (!str) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /* ============================================================================================ */
  capitalize(str : string) {
    if (!str) return str;
    return str[0].toUpperCase() + str.substring(1).toLowerCase();
  }

  /* ============================================================================================ */
  showHistoryModal(): void {
    this.modalService.openHistoryModal(this.stationId, this.stationName);
  }

  /* ============================================================================================ */
  toggleMap() {
    this.showMap = !this.showMap;
  }
}

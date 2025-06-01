import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { ApiService } from '../../services/APIConnection/api.service';
import { StationData } from '../../services/WeatherDataJson/weather-data.service';

let L: any;

@Component({
  selector: 'app-weather-map',
  imports: [CommonModule],
  templateUrl: './weather-map.component.html',
  styleUrl: './weather-map.component.css'
})
export class WeatherMapComponent implements OnInit, AfterViewInit, OnDestroy{
  private map: any;
  private stationsLayer!: L.LayerGroup;
  private heatLayer: any;
  private isBrowser: boolean;
  
  isLoading: boolean = true;
  errorMessage: string | null = null;

  /* ============================================================================================ */
  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /* ============================================================================================ */
  // Add Leaflet CSS
  ngOnInit(): void {
    // Only load Leaflet in browser environment
    if (this.isBrowser) {
      // Dynamically import Leaflet
      import('leaflet').then(leaflet => {
        L = leaflet;
        // Import heat plugin after Leaflet is loaded
        import('leaflet.heat').then(() => {
          // Now it's safe to add CSS
          const linkElement = document.createElement('link');
          linkElement.rel = 'stylesheet';
          linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; // Latest as of 30/05/2025
          document.head.appendChild(linkElement);
        });
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        // Only initialize map if Leaflet is loaded
        if (L) {
          this.initMap();
        } else {
          // Wait for Leaflet to load if not ready yet
          const checkLeaflet = setInterval(() => {
            if (L) {
              clearInterval(checkLeaflet);
              this.initMap();
            }
          }, 100);
        }
      }, 100);
    } else {
      // For SSR, just mark as not loading
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.map) {
      this.map.remove();
    }
  }

  /* ============================================================================================ */
  private initMap(): void {
    if (!this.isBrowser || !document.getElementById('temperature-map')) {
      return;
    }

    this.map = L.map('temperature-map', {
      center: [52.1326, 5.2913],
      zoom: 8
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.stationsLayer = L.layerGroup().addTo(this.map);

    this.loadStationsData();
  }

  /* ============================================================================================ */
  private loadStationsData(): void {
    if (!this.isBrowser) return;

    this.isLoading = true;
    this.errorMessage = null;
    
    this.apiService.getAllStationsWithWeather().subscribe({
      next: (stations) => {
        this.renderHeatMap(stations);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading stations data:', err);
        this.errorMessage = 'Failed to load stations data';
        this.isLoading = false;
      }
    });
  }

  /* ============================================================================================ */
  private renderHeatMap(stations: StationData[]): void {
    if (!this.isBrowser || !this.map) return;

    this.stationsLayer.clearLayers();

    if (this.heatLayer && this.map.hasLayer(this.heatLayer)) {
      this.map.removeLayer(this.heatLayer);
    }

    const heatData = stations.map(station => {
      const lat = station.lat;
      const lon = station.lon;
      const temp = station.temperature;

      // Add markers for each station
      const marker = L.marker([lat, lon]);
      marker.bindPopup(`
        <strong>${station.stationName}</strong><br>
        Temperatuur: ${temp.toFixed(1)}°C
        `);

      this.stationsLayer.addLayer(marker);

      return [lat, lon, this.normalizeTemperature(temp)];
    })

    this.heatLayer = (L as any).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: this.getTemperatureGradient()
    }).addTo(this.map);
  }

  /* ============================================================================================ */
  private normalizeTemperature(temp: number): number {
    return Math.max(0, Math.min(1, (temp + 10) / 50));
  }

  /* ============================================================================================ */
  private getTemperatureGradient(): any {
    return {
      0.0: '#0000FF', // Blue (cold)
      0.2: '#00FFFF', // Cyan
      0.4: '#00FF00', // Green
      0.6: '#FFFF00', // Yellow
      0.8: '#FF8000', // Orange
      1.0: '#FF0000'  // Red (hot) 
    };
  }
}

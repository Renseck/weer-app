import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, PLATFORM_ID, Inject, Input } from '@angular/core';
import { ApiService } from '../../services/APIConnection/api.service';
import { StationData } from '../../services/WeatherDataJson/weather-data.service';
import * as turf from '@turf/turf';

let L: any;

export enum WeatherDataType {
  Temperature = 'temperature',
  Rainfall = 'rainfallLastHour',
  Humidity = 'humidity',
  SunPower = 'sunPower',
  WindSpeed = 'windSpeed'
}

@Component({
  selector: 'app-weather-map',
  imports: [CommonModule],
  templateUrl: './weather-map.component.html',
  styleUrl: './weather-map.component.css'
})
export class WeatherMapComponent implements OnInit, AfterViewInit, OnDestroy{
  private map: any;
  private stationsLayer!: L.LayerGroup;
  private interpolationLayer!: L.LayerGroup;
  private isBrowser: boolean;
  private tempOpacity: number = 0.5;
  
  isLoading: boolean = true;
  errorMessage: string | null = null;

  public weatherDataTypes = WeatherDataType;
  public selectedDataType: WeatherDataType = WeatherDataType.Temperature;

  @Input() locationLat: number | null = null;
  @Input() locationLon: number | null = null;

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
        // Now it's safe to add CSS
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; // Latest as of 30/05/2025
        document.head.appendChild(linkElement);
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
  public switchDataType(dataType: WeatherDataType): void {
    if (this.selectedDataType !== dataType) {
      this.selectedDataType = dataType;

      if (!this.isLoading && this.map) {
        this.loadStationsData();
      }
    }
  }

  /* ============================================================================================ */
  private initMap(): void {
    if (!this.isBrowser || !document.getElementById('temperature-map')) {
      return;
    }

    const panBounds = L.latLngBounds(
      [50.47, 3.2],
      [53.7, 7.38]
    );

    this.map = L.map('temperature-map', {
      center: [52.1326, 5.2913],
      zoom: 7,
      zoomControl: true,
      attributionControl: true,
      maxBounds: panBounds,
      minZoom: 7,
      maxBoundsViscosity: 1.0
    });

    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(this.map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
      bounds: panBounds
    }).addTo(this.map);

    this.stationsLayer = L.layerGroup().addTo(this.map);
    this.interpolationLayer = L.layerGroup().addTo(this.map);

    this.map.fitBounds(panBounds);

    this.loadStationsData();
  }

  /* ============================================================================================ */
  private loadStationsData(): void {
    if (!this.isBrowser) return;

    this.isLoading = true;
    this.errorMessage = null;
    
    this.apiService.getAllStationsWithWeather().subscribe({
      next: (stations) => {
        stations.forEach(station => {
          station.windSpeedKph = station.windSpeed * 3.6;
        });

        this.renderDataMap(stations);
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
  private renderDataMap(stations: StationData[]): void {
    if (!this.isBrowser || !this.map) return;

    // Clear existing layers
    this.stationsLayer.clearLayers();
    this.interpolationLayer.clearLayers();

    // Determine which data property is requested
    let dataProperty: string;
    let dataUnit: string;
    let popupLabel: string;
    let values: number[];
    let minValue: number;
    let maxValue: number;

    switch(this.selectedDataType) {
      case WeatherDataType.Rainfall:
        dataProperty = 'rainfallLastHour';
        dataUnit = 'mm';
        popupLabel = 'Neerslag';
        values = stations.map(s => s.rainfallLastHour);
        minValue = 0; // Rain starts at 0
        maxValue = Math.max(5, Math.ceil(Math.max(...values))); // At least 5mm scale
        break;

      case WeatherDataType.Humidity:
        dataProperty = 'humidity';
        dataUnit = '%';
        popupLabel = 'Luchtvochtigheid';
        values = stations.map(s => s.humidity);
        minValue = Math.max(0, Math.floor(Math.min(...values))); // Min 0%
        maxValue = Math.max(100, Math.ceil(Math.max(...values))); // Max 100%
        break;

      case WeatherDataType.SunPower:
        dataProperty = 'sunPower';
        dataUnit = 'W/m²';
        popupLabel = 'Zonnekracht';
        values = stations.map(s => s.sunPower);
        minValue = 0; // Min at 0 W/m²
        maxValue = Math.max(500, Math.ceil(Math.max(...values))); // At least 500
        break;
      
      case WeatherDataType.WindSpeed:
        dataProperty = 'windSpeedKph';
        dataUnit = 'km/h';
        popupLabel = 'Windsnelheid';
        values = stations.map(s => s.windSpeedKph);
        minValue = 0; // Min at 0 km/h
        maxValue = Math.max(40, Math.ceil(Math.max(...values))); // At least 40km/h
        break;

      case WeatherDataType.Temperature:
      default:
        dataProperty = 'temperature';
        dataUnit = '°C';
        popupLabel = 'Temperatuur';
        values = stations.map(s => s.temperature);
        minValue = Math.floor(Math.min(...values) * 2) / 2 - 0.5;
        maxValue = Math.ceil(Math.max(...values) * 2) / 2 + 0.5;
        break;
    }

    // Extract data
    const points = stations.map(station => {
      return turf.point([station.lon, station.lat], { 
        value: station[dataProperty as keyof StationData] as number,
        stationName: station.stationName
      });
    });
    
    // Create a FeatureCollection from the points
    const pointsCollection = turf.featureCollection(points);
    
    // Get map bounds
    const bounds = this.map.getBounds();
    const boundingBox: [number, number, number, number] = [
      bounds.getWest(),    // west
      bounds.getSouth(),   // south
      bounds.getEast(),    // east
      bounds.getNorth()    // north
    ];
    
    try {
    // OPTIMIZATION 1: Use the fallback IDW method directly
    // This is more reliable and likely more efficient than the turf.interpolate method
    this.renderOptimizedIDW(stations, minValue, maxValue, dataProperty);
  } catch (error) {
    console.error('Interpolation error:', error);
    // Still have the original fallback as a last resort
    this.renderIDWMap(stations, dataProperty);
  }
    
    // Add station markers on top
    stations.forEach(station => {
      const marker = L.circleMarker([station.lat, station.lon], {
        radius: 5,
        color: 'white',
        weight: 1,
        opacity: 1,
        fillColor: 'black',
        fillOpacity: 1
      });
      
      marker.bindPopup(`
        <strong>${station.stationName}</strong><br>
        ${popupLabel}: ${(station[dataProperty as keyof StationData] as number).toFixed(1)}${dataUnit}
      `);
      
      this.stationsLayer.addLayer(marker);
    });

    // Add user location marker if coordinates are provided
    if (this.locationLat && this.locationLon) {
      // Create a special marker for the requested location
      const locationIcon = L.divIcon({
        className: 'custom-location-marker',
        html: `<div class="marker-pin"></div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      });
      
      const locationMarker = L.marker([this.locationLat, this.locationLon], {
        icon: locationIcon,
        zIndexOffset: 1000 // Ensure it's on top of other markers
      });
      
      locationMarker.bindPopup(`
        <strong>Jouw locatie</strong><br>
        ${this.locationLat.toFixed(4)}, ${this.locationLon.toFixed(4)}
      `);
      
      this.stationsLayer.addLayer(locationMarker);
      
      const pulseCircle = L.circleMarker([this.locationLat, this.locationLon], {
        radius: 7,
        color: '#4ad6ed',
        fillColor: '#4ad6ed',
        fillOpacity: 0.3,
        weight: 2,
        className: 'pulse-circle'
      });
      
      this.stationsLayer.addLayer(pulseCircle);
    }
    
    // Add temperature legend
    this.addDataLegend(minValue, maxValue);
  }

  /* ============================================================================================ */
  private getDataColor(normalizedValue: number): string {
    let gradient: { [key: number]: string };

    switch (this.selectedDataType) {
      case WeatherDataType.Rainfall:
        gradient = {
          0.0: '#ffffff', // No rain (white)
          0.2: '#c6dbef', // Light blue
          0.4: '#9ecae1', // Medium light blue
          0.6: '#6baed6', // Medium blue
          0.8: '#3182bd', // Deep blue
          1.0: '#08519c'  // Very deep blue
        }
        break;

      case WeatherDataType.Humidity:
        gradient = {
          0.0: '#ffffff', // Low humidity (white)
          0.2: '#deebf7', // Very light blue
          0.4: '#9ecae1', // Light blue
          0.6: '#4292c6', // Medium blue
          0.8: '#2171b5', // Deep blue
          1.0: '#084594'  // Very deep blue
        };
        break;

      case WeatherDataType.SunPower:
        gradient = {
          0.0: '#ffffcc', // Low sun power (very light yellow)
          0.2: '#ffeda0', // Light yellow
          0.4: '#fed976', // Yellow
          0.6: '#feb24c', // Light orange
          0.8: '#fd8d3c', // Orange
          1.0: '#bd0026'  // Deep red
        };
        break;

      case WeatherDataType.WindSpeed:
        gradient = {
          0.0: '#f7fcfd', // Low wind (almost white)
          0.2: '#e0ecf4', // Very light blue-green
          0.4: '#bfd3e6', // Light blue-purple
          0.6: '#9ebcda', // Medium blue-purple
          0.8: '#8c96c6', // Blue-purple
          1.0: '#6e016b'  // Deep purple
        };
        break;

      case WeatherDataType.Temperature:
      default:
        gradient = {
          0.0: '#0039b5', // Deep blue (cold)
          0.2: '#208fff', // Light blue
          0.4: '#36ba53', // Green
          0.6: '#ffd500', // Yellow
          0.8: '#ff6c00', // Orange
          1.0: '#d80000'  // Deep red (hot)
        };
    }

    const gradientPoints = Object.keys(gradient).map(key => parseFloat(key)).sort((a, b) => a - b);
    let lowerPoint = gradientPoints[0];
    let upperPoint = gradientPoints[gradientPoints.length - 1];

    for (let i = 0; i < gradientPoints.length - 1; i++) {
      if (normalizedValue >= gradientPoints[i] && normalizedValue <= gradientPoints[i + 1]) {
        lowerPoint = gradientPoints[i];
        upperPoint = gradientPoints[i + 1];
        break;
      }
    }

    const range = upperPoint - lowerPoint;
    const factor = range === 0 ? 0 : (normalizedValue - lowerPoint) / range;

    return this.interpolateColor(gradient[lowerPoint], gradient[upperPoint], factor);
  }

  /* ============================================================================================ */
  private addDataLegend(minValue: number, maxValue: number): void {
    // Remove existing legend if there is one
    const existingLegend = document.querySelector('.temperature-legend');
    if (existingLegend) {
      existingLegend.remove();
    }

    let title: string;
    let gradientColors: string;
    
    switch(this.selectedDataType) {
      case WeatherDataType.Rainfall:
        title = 'Neerslag (mm)';
        gradientColors = 'linear-gradient(to right, #ffffff, #c6dbef, #9ecae1, #6baed6, #3182bd, #08519c)'
        break;

      case WeatherDataType.Humidity:
        title = 'Luchtvochtigheid (%)';
        gradientColors = 'linear-gradient(to right, #ffffff, #deebf7, #9ecae1, #4292c6, #2171b5, #084594)';
        break;

      case WeatherDataType.SunPower:
        title = 'Zonnekracht (W/m²)';
        gradientColors = 'linear-gradient(to right, #ffffcc, #ffeda0, #fed976, #feb24c, #fd8d3c, #bd0026)';
        break;

      case WeatherDataType.WindSpeed:
        title = 'Windsnelheid (km/h)';
        gradientColors = 'linear-gradient(to right, #f7fcfd, #e0ecf4, #bfd3e6, #9ebcda, #8c96c6, #6e016b)';
        break;

      case WeatherDataType.Temperature:
      default:
        title = 'Temperatuur (°C)';
        gradientColors = 'linear-gradient(to right, #0039b5, #208fff, #36ba53, #ffd500, #ff6c00, #d80000)';
        break;
    }
    
    // Create legend container
    const legend = L.control({position: 'bottomright'});
    
    legend.onAdd = (_map: any) => {
    const div = L.DomUtil.create('div', 'data-legend temperature-legend');
    
    // Apply styles directly to the div elements
    div.innerHTML = `
      <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${title}</h4>
      <div class="gradient" style="height: 15px; width: 100%; margin-bottom: 8px; border-radius: 4px; background: ${gradientColors};"></div>
      <div style="display: flex; justify-content: space-between; font-size: 12px;">
        <span>${minValue.toFixed(1)}</span>
        <span>${((minValue + maxValue) / 2).toFixed(1)}</span>
        <span>${maxValue.toFixed(1)}</span>
      </div>
    `;
      return div;
    };
    
    legend.addTo(this.map);
  }

  /* ============================================================================================ */
  private interpolateColor(color1: string, color2: string, factor: number): string {
    // Convert hex to rgb
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    // Interpolate
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /* ============================================================================================ */
  private renderOptimizedIDW(stations: StationData[], minValue: number, maxValue: number, dataProperty: string): void {
    if (!this.isBrowser || !this.map) return;

    const lats = stations.map(s => s.lat);
    const lons = stations.map(s => s.lon);
    const values = stations.map(s => s[dataProperty as keyof StationData] as number);

    // Get map bounds
    const bounds = this.map.getBounds();
    const west = bounds.getWest();
    const east = bounds.getEast();
    const south = bounds.getSouth();
    const north = bounds.getNorth();

    // OPTIMIZATION 2: Reduce canvas size for better performance
    const canvas = document.createElement('canvas');
    const width = 400;
    const height = 400; 
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Create image data
    const imageData = ctx.createImageData(width, height);
    
    // OPTIMIZATION 3: Process in chunks to avoid timeout
    const chunkSize = 40; // Process 40 rows at a time
    
    const processChunk = (startY: number) => {
      const endY = Math.min(startY + chunkSize, height);
      
      for (let y = startY; y < endY; y++) {
        for (let x = 0; x < width; x++) {
          // Convert pixel position to geo coordinates
          const lon = west + (east - west) * (x / width);
          const lat = north - (north - south) * (y / height);
          
          // OPTIMIZATION 4: More efficient IDW calculation
          let weightedSum = 0;
          let weightSum = 0;
          
          // Use a fixed power parameter for faster calculation
          const power = 2;
          
          for (let i = 0; i < stations.length; i++) {
            // Calculate squared distance (avoid sqrt for performance)
            const dx = lons[i] - lon;
            const dy = lats[i] - lat;
            const distSquared = dx * dx + dy * dy;
            
            // Avoid division by zero with a small epsilon
            const weight = 1 / Math.max(distSquared, 1e-10);
            weightedSum += values[i] * weight;
            weightSum += weight;
          }
          
          const value = weightedSum / weightSum;
          
          // Get color for the interpolated temperature
          const normalizedTemp = (value - minValue) / (maxValue - minValue);
          const color = this.getDataColor(Math.max(0, Math.min(1, normalizedTemp)));
          
          // Set pixel color
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          
          const idx = (y * width + x) * 4;
          imageData.data[idx] = r;
          imageData.data[idx + 1] = g;
          imageData.data[idx + 2] = b;
          imageData.data[idx + 3] = 255 * this.tempOpacity; // Alpha (acts as opacity)
        }
      }
      
      // If there are more rows to process, schedule the next chunk
      if (endY < height) {
        setTimeout(() => processChunk(endY), 0);
      } else {
        // All chunks processed, finalize the rendering
        ctx.putImageData(imageData, 0, 0);
        
        // Add as overlay
        const imageUrl = canvas.toDataURL();
        L.imageOverlay(
          imageUrl,
          [[south, west], [north, east]],
          { opacity: 0.7 }
        ).addTo(this.interpolationLayer);
      }
    };
    
    // Start processing the first chunk
    processChunk(0);
  }

  /* ============================================================================================ */
  private renderIDWMap(stations: StationData[], dataProperty: string): void {
    // ... your existing code adapted for IDW interpolation
    console.log("Falling back to IDW interpolation");
    
    if (!this.isBrowser || !this.map) return;
  
    // Clear layers
    this.stationsLayer.clearLayers();
    this.interpolationLayer.clearLayers();

    const lats = stations.map(s => s.lat);
    const lons = stations.map(s => s.lon);
    const values = stations.map(s => s[dataProperty as keyof StationData] as number);

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const paddedMin = Math.floor(minValue * 2) / 2 - 0.5;
    const paddedMax = Math.ceil(maxValue * 2) / 2 + 0.5;

    // Create canvas
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 800;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Get map bounds
    const bounds = this.map.getBounds();
    const west = bounds.getWest();
    const east = bounds.getEast();
    const south = bounds.getSouth();
    const north = bounds.getNorth();

    // Create image data
    const imageData = ctx.createImageData(width, height);
    
    // For each pixel in the canvas, calculate IDW
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Convert pixel position to geo coordinates
        const lon = west + (east - west) * (x / width);
        const lat = north - (north - south) * (y / height);
        
        // Calculate IDW
        let weightedSum = 0;
        let weightSum = 0;
        
        for (let i = 0; i < stations.length; i++) {
          // Calculate distance (simplified - not accounting for Earth's curvature)
          const dx = lons[i] - lon;
          const dy = lats[i] - lat;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // IDW formula with power parameter of 2
          const weight = 1 / Math.max(distance * distance, 0.000001);
          weightedSum += values[i] * weight;
          weightSum += weight;
        }
        
        // Final interpolated value
        const value = weightedSum / weightSum;
        
        // Normalize and get color
        const normalizedTemp = (value - paddedMin) / (paddedMax - paddedMin);
        const color = this.getDataColor(Math.max(0, Math.min(1, normalizedTemp)));
        
        // Set pixel color
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        const idx = (y * width + x) * 4;
        imageData.data[idx] = r;
        imageData.data[idx + 1] = g;
        imageData.data[idx + 2] = b;
        imageData.data[idx + 3] = 204; // Alpha (80% opacity)
      }
    }
    
    // Put image data to canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Add as overlay
    const imageUrl = canvas.toDataURL();
    L.imageOverlay(
      imageUrl,
      [[south, west], [north, east]],
      { opacity: 0.7 }
    ).addTo(this.interpolationLayer);
    
    // Add station markers
    stations.forEach(station => {
      // Your existing marker code
    });
    
    // Add legend
    this.addDataLegend(paddedMin, paddedMax);
  }
}

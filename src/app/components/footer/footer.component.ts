import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  @Input() timestamp: string = '';
  @Input() stationName: string = '';
  @Input() isLoading: boolean = false;
  
  @Input() locationLat: number = 0;
  @Input() locationLon: number = 0;
  
  @Input() stationLat: number = 0;
  @Input() stationLon: number = 0;

  @Output() refreshWeatherData = new EventEmitter<void>();

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
  calculateDistance(): number {
    if (!this.locationLat || !this.locationLon || !this.stationLat || !this.stationLon) {
      return 0;
    }
    
    // Haversine formula implementation
    const R = 6371; // Earth's radius in km
    
    // Convert degrees to radians
    const lat1Rad = this.toRadians(this.locationLat);
    const lon1Rad = this.toRadians(this.locationLon);
    const lat2Rad = this.toRadians(this.stationLat);
    const lon2Rad = this.toRadians(this.stationLon);
    
    // Differences
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    
    // Haversine formula
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }
  
  /* ============================================================================================ */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  /* ============================================================================================ */
  getDistanceText(): string {
    const distance = this.calculateDistance();
    if (distance === 0) return '';
    
    if (distance < 1) {
      // Convert to meters for small distances
      return `${Math.round(distance * 1000)}m van locatie`;
    } else {
      return `${distance}km van locatie`;
    }
  }

}

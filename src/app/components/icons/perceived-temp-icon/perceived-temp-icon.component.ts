import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perceived-temp-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perceived-temp-icon.component.html',
  styleUrl: './perceived-temp-icon.component.css'
})
export class PerceivedTempIconComponent implements OnChanges {
  @Input() feelTemperature: number = 0;
  displayValue = '0°';
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['feelTemperature']) {
      console.log('New feel temperature:', this.feelTemperature);
      this.updateValue();
    }
  }
  
  private updateValue() {
    this.displayValue = `${this.feelTemperature.toFixed(1)}°`;
  }
}

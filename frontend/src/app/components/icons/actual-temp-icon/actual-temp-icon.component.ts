import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggingConfig } from '../../../config/logging-config';

@Component({
  selector: 'app-actual-temp-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actual-temp-icon.component.html',
  styleUrl: './actual-temp-icon.component.css'
})
export class ActualTempIconComponent implements OnChanges {
  @Input() actualTemperature: number = 0;
  displayValue = '0°';
  
  /* ============================================================================================ */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['actualTemperature']) {
      if (LoggingConfig.iconLogging)
      {
        console.log('New actual temperature:', this.actualTemperature);
      }
      this.updateValue();
    }
  }
  
  /* ============================================================================================ */
  private updateValue() {
    this.displayValue = `${this.actualTemperature.toFixed(1)}°`;
  }
}

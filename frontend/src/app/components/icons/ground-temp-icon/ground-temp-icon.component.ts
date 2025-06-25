import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { LoggingConfig } from '../../../config/logging-config';
@Component({
  selector: 'app-ground-temp-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ground-temp-icon.component.html',
  styleUrl: './ground-temp-icon.component.css'
})
export class GroundTempIconComponent implements OnChanges {
  @Input() groundTemperature: number = 0;
  displayValue = '0°';

  /* ============================================================================================ */
  ngOnChanges(changes: SimpleChanges): void {
      if (changes["groundTemperature"]) {
        this.updateValue();
        if (LoggingConfig.iconLogging)
        {
          console.log("New ground temperature: ", this.groundTemperature);
        }
      }
  }

  /* ============================================================================================ */
  private updateValue() {
    this.displayValue = `${this.groundTemperature.toFixed(1)}°`;
  }
}

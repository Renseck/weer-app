import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggingConfig } from '../../../config/logging-config';
import { OnChanges } from '@angular/core';

@Component({
  selector: 'app-wind-compass-icon',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './wind-compass-icon.component.html',
  styleUrl: './wind-compass-icon.component.css'
})
export class WindCompassIconComponent implements OnChanges {
  @Input() windDirectionDegrees: number = 0;
  @Input() windSpeed: number = 0; // m/s

  private _cardinalDirection: string = "N";
  showTooltip: boolean = false;

  /* ============================================================================================ */
  get cardinalDirection() : string {
    return this._cardinalDirection;
  }

  /* ============================================================================================ */
  get beaufortScale(): number {
    return Math.round(1.127*Math.pow(this.windSpeed, 2/3));
  }

  get beaufortDescription(): string {
    const descriptions = [
      "Windstil", "Flauw en stil", "Zwak", "Matig",
      "Matig", "Vrij krachtig", "Krachtig", "Hard",
      "Stormachtig", "Storm", "Zware storm", "Zeer zware storm",
      "Orkaan"
    ];
    return descriptions[this.beaufortScale];
  }

  /* ============================================================================================ */
  get knots(): number {
    return Math.round(this.windSpeed * 0.539957);
  }

  /* ============================================================================================ */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["windDirectionDegrees"]) {
      this.updateCardinalDirection();
      if (LoggingConfig.iconLogging)
      {
        console.log("New wind direction value: ", this.windDirectionDegrees);
      }
    }

    if (changes["windSpeed"]) {
      if (LoggingConfig.iconLogging)
      {
        console.log("New wind speed value: ", this.windSpeed);
      }
    }
  }

  /* ============================================================================================ */
  toggleToolTip(): void {
    this.showTooltip = !this.showTooltip;
  }

  /* ============================================================================================ */
  private updateCardinalDirection(): void {
    const normalized = ((this.windDirectionDegrees % 360) + 360) % 360;

    const directions = [
      "N", "NNO", "NO", "ONO",
      "O", "OZO", "ZO", "ZZO",
      "Z", "ZZW", "ZW", "WZW",
      "W", "WNW", "NW", "NNW"
    ];

    const index = Math.round(normalized / 22.5) % 16;

    this._cardinalDirection = directions[index];
  }
}

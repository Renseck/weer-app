import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wind-compass-icon',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './wind-compass-icon.component.html',
  styleUrl: './wind-compass-icon.component.css'
})
export class WindCompassIconComponent {
  @Input() windDirectionDegrees: number = 0;
  private _cardinalDirection: string = "N";

  get cardinalDirection() : string {
    return this._cardinalDirection;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["windDirectionDegrees"]) {
      this.updateCardinalDirection();
      console.log("New wind direction value: ", this.windDirectionDegrees);
    }
  }

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

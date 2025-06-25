import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { LoggingConfig } from '../../../config/logging-config';
@Component({
  selector: 'app-sun-icon',
  imports: [CommonModule],
  templateUrl: './sun-icon.component.html',
  styleUrl: './sun-icon.component.css'
})
export class SunIconComponent implements OnChanges, OnDestroy {
  @Input() solarPower: number = 0;
  maxValue: number = 1600;

  sunColor: string = '#FFED004D';

  // Animation properties
  private currentBrightness: number = 0;
  private targetBrightness: number = 0;
  private animationId: number | null = null;
  private animationSpeed: number = 0.015;

  private readonly colorStops = [
    {threshold: 0.0, color: '#FFED004D'},
    {threshold: 0.3, color: '#FFED004D'},
    {threshold: 0.6, color: '#FFED0099'},
    {threshold: 0.85, color: '#FFED00D9'},
    {threshold: 1.0, color: '#FFED00'},
  ]

  /* ============================================================================================ */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["solarPower"]) {
      this.updateSunColor();

      this.targetBrightness = Math.min(Math.max(this.solarPower / this.maxValue, 0), 1);
      this.animationSpeed = 0.02*this.targetBrightness;
      
      this.startBrightnessAnimation();
      if (LoggingConfig.iconLogging)
      {
        console.log("New solar power value: ", this.solarPower);
      }
    }
  }

  /* ============================================================================================ */
  ngOnDestroy(): void {
      if (this.animationId !== null) {
        cancelAnimationFrame(this.animationId);
      }
  }

  /* ============================================================================================ */
  private startBrightnessAnimation(): void {
    if (this.animationId !== null) {
        cancelAnimationFrame(this.animationId);
    }

    this.animateBrightness();
  }

  /* ============================================================================================ */
  private animateBrightness(): void {
    if(this.currentBrightness < this.targetBrightness) {
      this.currentBrightness = Math.min(
        this.currentBrightness + this.animationSpeed, this.targetBrightness
      );
      this.updateSunColor();
      this.animationId = requestAnimationFrame(() => this.animateBrightness())
    }
    else if (this.currentBrightness > this.targetBrightness) {
      this.currentBrightness = Math.max(
        this.currentBrightness - this.animationSpeed, this.targetBrightness
      );
      this.updateSunColor();
      this.animationId = requestAnimationFrame(() => this.animateBrightness())
    }
    else {
      this.animationId = null;
    }
  }

  /* ============================================================================================ */
  private updateSunColor(): void {
    const brightness = this.currentBrightness;

    let lowerStop = this.colorStops[0];
    let upperStop = this.colorStops[this.colorStops.length - 1];

    // Search for which color to stop at
    for (let i = 0; i < this.colorStops.length - 1; i++) {
      if (brightness >= this.colorStops[i].threshold && 
          brightness <= this.colorStops[i + 1].threshold) {
        lowerStop = this.colorStops[i];
        upperStop = this.colorStops[i + 1];
        break;
      }
    }

    // If we're already at a stop, just use that color
    if (lowerStop.threshold === brightness) {
      this.sunColor = lowerStop.color;
      return;
    }

    const range = upperStop.threshold - lowerStop.threshold;
    const normalizedPosition = (brightness - lowerStop.threshold) / range;

    const lowerColor = this.parseColor(lowerStop.color);
    const upperColor = this.parseColor(upperStop.color);
    
    // Interpolate each component
    const r = Math.round(lowerColor.r + normalizedPosition * (upperColor.r - lowerColor.r));
    const g = Math.round(lowerColor.g + normalizedPosition * (upperColor.g - lowerColor.g));
    const b = Math.round(lowerColor.b + normalizedPosition * (upperColor.b - lowerColor.b));
    const a = lowerColor.a + normalizedPosition * (upperColor.a - lowerColor.a);
    
    this.sunColor = `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  }

  /* ============================================================================================ */
  private parseColor(color: string) : {r: number, g: number, b: number, a: number } {
    let hex = color.substring(1);

    let r, g, b, a = 1;

    if (hex.length === 8)
    {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16) / 255;
    }
    else
    {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    return { r, g, b, a};
  } 

  /* ============================================================================================ */
}

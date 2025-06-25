import { Component, HostBinding, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggingConfig } from '../../../config/logging-config';
@Component({
  selector: 'app-rain-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rain-icon.component.html',
  styleUrl: './rain-icon.component.css'
})
export class RainIconComponent implements OnChanges, OnDestroy {
  @Input() rainValue: number = 3; // in mm
  maxRainAmount: number = 10;

  rainPercentage: number = 0;
  displayValue: string = '0mm';

  // Animation properties
  private targetPercentage: number = 0;
  private animationId: number | null = null;
  private animationSpeed: number = 0.015;

  /* ============================================================================================ */
  @HostBinding('attr.high-rainfall') get IsHighRainfall () {
    return this.rainValue > this.maxRainAmount ? 'true' : null;
  }

  /* ============================================================================================ */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rainValue']) 
      if (LoggingConfig.iconLogging)
      {
        console.log("New rain value: ", this.rainValue);
      }
      this.updateRainDisplay();
      
  }

  /* ============================================================================================ */
  private updateRainDisplay(): void {
    this.targetPercentage = Math.min(this.rainValue / this.maxRainAmount, 1);
    this.animationSpeed = 0.02*this.targetPercentage;

    this.displayValue = `${this.rainValue}mm`;

    this.startFillAnimation();
  }

  /* ============================================================================================ */
  ngOnDestroy():void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
  }
  
  /* ============================================================================================ */
  private startFillAnimation() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    this.animateFill();
  }

  /* ============================================================================================ */
  private animateFill(): void {
    if (this.rainPercentage < this.targetPercentage) {
      this.rainPercentage = Math.min(
        this.rainPercentage + this.animationSpeed, this.targetPercentage
      );
      this.animationId = requestAnimationFrame(() => this.animateFill());
    }
    else if (this.rainPercentage > this.targetPercentage) {
      this.rainPercentage = Math.max(
        this.rainPercentage - this.animationSpeed, this.targetPercentage
      );
      this.animationId = requestAnimationFrame(() => this.animateFill());
    }
    else {
      this.animationId = null;
    }
    
  }
  /* ============================================================================================ */
}

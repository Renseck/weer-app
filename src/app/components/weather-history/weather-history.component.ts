import { Component, OnChanges, SimpleChanges, ElementRef, HostListener } from '@angular/core';
import { Output, Input, OnInit, AfterViewInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { ApiService } from '../../services/APIConnection/api.service';
import { WeatherData } from '../../services/WeatherDataJson/weather-data.service';

@Component({
  selector: 'app-weather-history',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './weather-history.component.html',
  styleUrl: './weather-history.component.css'
})
export class WeatherHistoryComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() stationId: number = 0;
  @Input() stationName: string = '';
  @Output() closeModal = new EventEmitter<void>();

  historyData: WeatherData[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Chart data - separate from WeatherData
  temperatureData: any[] = [];
  feelsLikeData: any[] = [];
  rainData: any[] = [];
  sunData: any[] = [];

  // Chart options
  view: [number, number] = [500, 300];
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showXAxisLabel: boolean = true;
  showYAxisLabel: boolean = true;
  xAxisLabel: string = "Tijd";
  yAxisLabel: string = "Temperatuur (°C)";
  timeline: boolean = true;

  temperatureColorScheme:  Color = {
    name: "temperatureColors",
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4ad6ed', '#ff7f0e', '#2ca02c']
  };
  
  rainfallColorScheme = {
    name: 'rainfallColors',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4ad6ed']
  };
  
  solarColorScheme = {
    name: 'solarColors',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#FFEB3B']
  };

  @HostListener('window:resize')
  onResize() {
    this.resizeCharts();
  }

  /* ============================================================================================ */
  constructor(private apiService: ApiService, private el: ElementRef) {}

  /* ============================================================================================ */
  ngOnInit(): void {
      if (this.stationId) {
        this.loadHistoricalData();
      }
  }

  ngAfterViewInit(): void {
    // Set initial size after view is initialized
    this.resizeCharts()
  }

  /* ============================================================================================ */
  ngOnChanges(changes: SimpleChanges): void {
      if (changes['stationId'] && !changes["stationId"].firstChange) {
        this.loadHistoricalData();
      }
  }

  /* ============================================================================================ */
  loadHistoricalData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.apiService.getStationHistory(this.stationId).subscribe({
      next: (data) => {
        this.historyData = data.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        this.prepareChartData();
        this.isLoading = false;
        setTimeout(() => this.resizeCharts(), 0);
      },
      error: (err) => {
        console.error("Error loading historical data:" , err);
        this.errorMessage = "Failed to load historical data";
        this.isLoading = false;
      }
    })
  }

  /* ============================================================================================ */
  prepareChartData(): void {
    this.temperatureData = [
      {
        name: 'Actuele temperatuur',
        series: this.historyData.map(item => ({
          name: new Date(item.timestamp),
          value: item.temperature
        }))
      },
      {
        name: 'Gevoelstemperatuur',
        series: this.historyData.map(item => ({
          name: new Date(item.timestamp),
          value: item.feelTemperature
        }))
      },
      {
        name: 'Grondtemperatuur',
        series: this.historyData.map(item => ({
          name: new Date(item.timestamp),
          value: item.groundTemperature
        }))
      }
    ];
    
    // Prepare rainfall data
    this.rainData = [
      {
        name: 'Regenvall',
        series: this.historyData.map(item => ({
          name: new Date(item.timestamp),
          value: item.rainfallLastHour
        }))
      }
    ];
    
    // Prepare sun power data
    this.sunData = [
      {
        name: "Zonnekracht",
        series: this.historyData.map(item => ({
          name: new Date(item.timestamp),
          value: item.sunPower
        }))
      }
    ];
  }

  /* ============================================================================================ */
  onCloseClick() : void {
    this.closeModal.emit();
  }

  /* ============================================================================================ */
  private resizeCharts(): void {
    setTimeout(() => {
      const container = this.el.nativeElement.querySelector('.charts-container');
      if (container) {
        const containerWidth = container.clientWidth;
        this.view = [containerWidth - 40, 300];
      }
      else
      {
        const containerWidth =  window.innerWidth * 0.8;
        this.view = [containerWidth - 40, 300];
      }
    }, 0);
    
  }
}

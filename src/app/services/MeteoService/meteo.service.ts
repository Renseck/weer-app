import { Injectable } from '@angular/core';
import { LoggingConfig } from '../../config/logging-config';

@Injectable({
  providedIn: 'root'
})
export class MeteoService {
  // Constant to identify missing data
  private readonly MISSING_DATA_VALUE = -999;

  constructor() { }

  calculateApparentTemperature(actualTemp: number, humidity: number, windSpeed: number): number {
    // Bounce out early if actual temp is not given, but this should never happen
    if (actualTemp === this.MISSING_DATA_VALUE)
    {
      return this.MISSING_DATA_VALUE;
    }

    if (actualTemp <= 15)
    {
      return this.calculateJAGTI(actualTemp, windSpeed);
    }

    if (actualTemp >= 20)
    {
      return this.calculateAT(actualTemp, humidity, windSpeed);
    }

    // In the inbetween, take a nice blend of the two
    const windChillComponent = this.calculateJAGTI(actualTemp, windSpeed);
    const humidityComponent = this.calculateAT(actualTemp, humidity, windSpeed);

    const weight = (actualTemp - 10) / 10;
    return windChillComponent * (1 - weight) + humidityComponent * weight;
  }

  /* ============================================================================================ */
  calculateJAGTI(actualTemp: number, windSpeed: number): number {
    // Note that windSpeed must be given in m/s
    const W = Math.pow(windSpeed*3.6, 0.16)
    return 13.12 + (0.6215*actualTemp) - (11.37 * W) + (0.3965* actualTemp * W);
  }

  /* ============================================================================================ */
  calculateAT(actualTemp: number, humidity: number, windSpeed: number): number {
    return actualTemp + (0.33*this.vapourPressure(actualTemp, humidity)) - 0.7*windSpeed - 4;
  }

  /* ============================================================================================ */
  vapourPressure(actualTemp: number, humidity: number): number {
    const e = 6.105 * Math.exp((17.27 * actualTemp)/(237.7 * actualTemp));
    return (humidity / 100) * e;
  }

  /* ============================================================================================ */
  processWeatherData(data: any): any {
    const processedData = { ...data };

    processedData.windSpeed = data.windSpeed || data.wind_speed || data.windspeed || 0;
    
    const originalFeelTemp = processedData.feelTemperature;

    if (processedData.feelTemperature === this.MISSING_DATA_VALUE) {
      const humidity = processedData.humidity !== undefined ?
                       processedData.humidity : 60;
      
      processedData.feelTemperature = this.calculateApparentTemperature(
        processedData.temperature,
        humidity, 
        processedData.windSpeed
      );

      if (LoggingConfig.tempCalculationLogging)
      {
        console.log("Calculated apparent temperature:", {
          stationName: processedData.stationName,
          actualTemp: processedData.temperature.toFixed(1) + '°C',
          calculatedFeelTemp: processedData.feelTemperature.toFixed(1) + '°C',
          humidity: humidity + '%',
          windSpeed: processedData.windSpeed*3.6 + ' km/h',
          formula: processedData.temperature <= 15 ? 'JAG/TI (cold)' :
                  processedData.temperature >= 20 ? 'AT (hot)' : "Blended",
          JAGTI: this.calculateJAGTI(processedData.temperature, processedData.windSpeed).toFixed(1) + '°C',
          AT: this.calculateAT(processedData.temperature, processedData.humidity, processedData.windSpeed).toFixed(1) + '°C'
        });
      }
    }
    else
    {
      // Even if it is given, console log it to see how well it performs
      const humidity = processedData.humidity !== undefined ?
                       processedData.humidity : 60;
      
      const calculatedTemp = this.calculateApparentTemperature(
        processedData.temperature,
        processedData.humidity,
        processedData.windSpeed
      );

      if (LoggingConfig.tempCalculationLogging)
      {
        console.log("Our formula would give:", {
          calculatedFeelTemp: calculatedTemp.toFixed(1) + '°C',
          difference: (calculatedTemp - originalFeelTemp).toFixed(1) + '°C',
          formula: processedData.temperature <= 15 ? 'JAGTI (Cold)' : 
                  processedData.temperature >= 20 ? 'AT (Hot)' : 'Blended',
          JAGTI: this.calculateJAGTI(processedData.temperature, processedData.windSpeed).toFixed(1) + '°C',
          AT: this.calculateAT(processedData.temperature, processedData.humidity, processedData.windSpeed).toFixed(1) + '°C',
          humidity: humidity + '%',
          windSpeed: processedData.windSpeed + 'm/s'
        });
      }
    }

    return processedData;
  }
}

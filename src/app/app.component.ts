import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherComponent } from './components/weather-display/weather-display.component';
import { ModalComponent } from './components/modal/modal.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WeatherComponent, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'eWeather';
}

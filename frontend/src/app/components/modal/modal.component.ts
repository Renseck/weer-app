import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { WeatherHistoryComponent } from '../weather-history/weather-history.component';
import { ModalService } from '../../services/ModalService/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, WeatherHistoryComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnInit {
  showModal: boolean = false;
  stationId: number = 0;
  stationName: string = '';

  /* ============================================================================================ */
  constructor(private modalService: ModalService) {}

  /* ============================================================================================ */
  ngOnInit(): void {
      this.modalService.showHistoryModal$.subscribe(show => {
        this.showModal = show;
        if (show) {
          document.body.style.overflow = 'hidden';
        }
        else
        {
          document.body.style.overflow = '';
        }
      });

      this.modalService.stationId$.subscribe(id => {
        this.stationId = id;
      });

      this.modalService.stationName$.subscribe(name => {
        this.stationName = name;
      })
  }

  /* ============================================================================================ */
  closeModal(event: any): void {
    if (!event || event.target.className === 'modal-backdrop') {
      this.modalService.closeHistoryModal();
    }
  }

}

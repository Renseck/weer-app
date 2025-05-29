import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private showHistoryModalSubject = new BehaviorSubject<boolean>(false);
  public showHistoryModal$ = this.showHistoryModalSubject.asObservable();
  
  private stationIdSubject = new BehaviorSubject<number>(0);
  public stationId$ = this.stationIdSubject.asObservable();
  
  private stationNameSubject = new BehaviorSubject<string>('');
  public stationName$ = this.stationNameSubject.asObservable();

  /* ============================================================================================ */
  constructor() { }

  /* ============================================================================================ */
  openHistoryModal(stationId: number, stationName: string): void {
    this.stationIdSubject.next(stationId);
    this.stationNameSubject.next(stationName);
    this.showHistoryModalSubject.next(true);
  }

  /* ============================================================================================ */
  closeHistoryModal(): void {
    this.showHistoryModalSubject.next(false);
  }
}

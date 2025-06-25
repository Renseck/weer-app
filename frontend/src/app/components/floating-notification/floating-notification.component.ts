import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floating-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-notification.component.html',
  styleUrl: './floating-notification.component.css'
})
export class FloatingNotificationComponent implements OnInit, OnDestroy {
  showNotification: boolean = true;
  isHiding: boolean = false;
  private autoHideTimer: any = null;

  /* ============================================================================================ */
  private startHideAnimation() {
    this.isHiding = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 500); // Match this to your CSS transition duration
    
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
  }

  /* ============================================================================================ */
  dismissNotification() {
    this.startHideAnimation();
  }

  /* ============================================================================================ */
  ngOnInit(): void {
    // const notificationDismissed = localStorage.getItem('weather-app-notification-dismissed') || 'true';
    this.showNotification = true;
    this.isHiding = false;

    this.autoHideTimer = setTimeout(() => {
      this.startHideAnimation();
    }, 30000); 
  }

  /* ============================================================================================ */
  ngOnDestroy(): void {
      if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = null;
      }
  }
}

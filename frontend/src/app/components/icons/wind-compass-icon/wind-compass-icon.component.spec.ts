import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindCompassIconComponent } from './wind-compass-icon.component';

describe('WindCompassIconComponent', () => {
  let component: WindCompassIconComponent;
  let fixture: ComponentFixture<WindCompassIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WindCompassIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WindCompassIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

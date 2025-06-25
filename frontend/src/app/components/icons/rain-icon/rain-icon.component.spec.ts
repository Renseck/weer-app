import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RainIconComponent } from './rain-icon.component';

describe('RainIconComponent', () => {
  let component: RainIconComponent;
  let fixture: ComponentFixture<RainIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RainIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RainIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

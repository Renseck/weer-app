import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerceivedTempIconComponent } from './perceived-temp-icon.component';

describe('PerceivedTempIconComponent', () => {
  let component: PerceivedTempIconComponent;
  let fixture: ComponentFixture<PerceivedTempIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerceivedTempIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerceivedTempIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

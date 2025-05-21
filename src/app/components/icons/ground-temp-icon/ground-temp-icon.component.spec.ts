import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroundTempIconComponent } from './ground-temp-icon.component';

describe('GroundTempIconComponent', () => {
  let component: GroundTempIconComponent;
  let fixture: ComponentFixture<GroundTempIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroundTempIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroundTempIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

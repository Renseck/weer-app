import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualTempIconComponent } from './actual-temp-icon.component';

describe('ActualTempIconComponent', () => {
  let component: ActualTempIconComponent;
  let fixture: ComponentFixture<ActualTempIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualTempIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActualTempIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

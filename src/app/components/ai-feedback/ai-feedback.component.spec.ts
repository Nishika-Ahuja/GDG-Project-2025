import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiFeedbackComponent } from './ai-feedback.component';

describe('AiFeedbackComponent', () => {
  let component: AiFeedbackComponent;
  let fixture: ComponentFixture<AiFeedbackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AiFeedbackComponent]
    });
    fixture = TestBed.createComponent(AiFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

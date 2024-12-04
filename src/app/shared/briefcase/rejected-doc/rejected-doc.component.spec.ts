import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedDocComponent } from './rejected-doc.component';

describe('RejectedDocComponent', () => {
  let component: RejectedDocComponent;
  let fixture: ComponentFixture<RejectedDocComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RejectedDocComponent]
    });
    fixture = TestBed.createComponent(RejectedDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

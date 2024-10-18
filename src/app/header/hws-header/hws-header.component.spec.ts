import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HwsHeaderComponent } from './hws-header.component';

describe('HwsHeaderComponent', () => {
  let component: HwsHeaderComponent;
  let fixture: ComponentFixture<HwsHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HwsHeaderComponent]
    });
    fixture = TestBed.createComponent(HwsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

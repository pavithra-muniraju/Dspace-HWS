import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HwsAboutComponent } from './hws-about.component';

describe('HwsAboutComponent', () => {
  let component: HwsAboutComponent;
  let fixture: ComponentFixture<HwsAboutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HwsAboutComponent]
    });
    fixture = TestBed.createComponent(HwsAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

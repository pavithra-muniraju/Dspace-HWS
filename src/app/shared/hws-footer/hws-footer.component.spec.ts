import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HwsFooterComponent } from './hws-footer.component';

describe('HwsFooterComponent', () => {
  let component: HwsFooterComponent;
  let fixture: ComponentFixture<HwsFooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HwsFooterComponent]
    });
    fixture = TestBed.createComponent(HwsFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

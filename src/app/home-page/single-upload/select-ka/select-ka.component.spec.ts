import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectKAComponent } from './select-ka.component';

describe('SelectKAComponent', () => {
  let component: SelectKAComponent;
  let fixture: ComponentFixture<SelectKAComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectKAComponent]
    });
    fixture = TestBed.createComponent(SelectKAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

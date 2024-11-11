import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBriefcaseComponent } from './my-briefcase.component';

describe('MyBriefcaseComponent', () => {
  let component: MyBriefcaseComponent;
  let fixture: ComponentFixture<MyBriefcaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyBriefcaseComponent]
    });
    fixture = TestBed.createComponent(MyBriefcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

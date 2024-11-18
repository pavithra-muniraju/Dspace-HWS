import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleUploadComponent } from './single-upload.component';

describe('SingleUploadComponent', () => {
  let component: SingleUploadComponent;
  let fixture: ComponentFixture<SingleUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SingleUploadComponent]
    });
    fixture = TestBed.createComponent(SingleUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

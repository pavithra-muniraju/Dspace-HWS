import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadItemComponent } from './upload-item.component';

describe('UploadItemComponent', () => {
  let component: UploadItemComponent;
  let fixture: ComponentFixture<UploadItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploadItemComponent]
    });
    fixture = TestBed.createComponent(UploadItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

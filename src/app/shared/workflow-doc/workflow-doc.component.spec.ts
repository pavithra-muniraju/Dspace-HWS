import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDocComponent } from './workflow-doc.component';

describe('WorkflowDocComponent', () => {
  let component: WorkflowDocComponent;
  let fixture: ComponentFixture<WorkflowDocComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkflowDocComponent]
    });
    fixture = TestBed.createComponent(WorkflowDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

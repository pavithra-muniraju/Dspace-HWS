import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedWorkflowActionSelectAuthorComponent } from './advanced-workflow-action-select-author.component';

describe('AdvancedWorkflowActionSelectAuthorComponent', () => {
  let component: AdvancedWorkflowActionSelectAuthorComponent;
  let fixture: ComponentFixture<AdvancedWorkflowActionSelectAuthorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancedWorkflowActionSelectAuthorComponent]
    });
    fixture = TestBed.createComponent(AdvancedWorkflowActionSelectAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import { MatStepper } from "@angular/material/stepper";
import { BehaviorSubject, debounceTime, filter, pluck, Subscription, switchMap } from 'rxjs';
import { HWSService } from 'src/app/HWS-Shared/hws.service';
import { SubmissionService } from 'src/app/submission/submission.service';
import { SubmissionObject } from 'src/app/core/submission/models/submission-object.model';
import {  hasValue, isEmpty, isNotEmptyOperator, isNotNull } from 'src/app/shared/empty.util';
import {Location} from '@angular/common'; 
import { Item } from 'src/app/core/shared/item.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RemoteData } from 'src/app/core/data/remote-data';
import parseSectionErrors from 'src/app/submission/utils/parseSectionErrors';
import { SubmissionError } from 'src/app/submission/objects/submission-error.model';
import { WorkspaceitemSectionsObject } from 'src/app/core/submission/models/workspaceitem-sections.model';
import { SubmissionDefinitionsModel } from 'src/app/core/config/models/config-submission-definitions.model';
import { Collection } from 'src/app/core/shared/collection.model';
import { ItemDataService } from 'src/app/core/data/item-data.service';
import { getAllSucceededRemoteData } from 'src/app/core/shared/operators';


@Component({
  selector: 'ds-single-upload',
  templateUrl: './single-upload.component.html',
  styleUrls: ['./single-upload.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {displayDefaultIndicatorType: false}
  }]
})
export class SingleUploadComponent {
  @ViewChild("stepper", { static: false }) private stepper: MatStepper;
  collectionModifiable: any;

  constructor(
    private activeModal: NgbActiveModal,
    private _formBuilder: FormBuilder,
    private hwsService: HWSService,
    private submissionService: SubmissionService,
    private location: Location,
    private route: ActivatedRoute,
    private itemDataService: ItemDataService,
    private changeDetectorRef: ChangeDetectorRef,
                      
  ) { }

  knowledgeAreaFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;
  completed: boolean = false;
  state: string;
  currentState = 0;
  knowledgeAreaList = [{value: 'lessonLearnt', viewValue: 'Lesson Learnt'},  ]
  selectedknowledgeArea:any
  
  private subs: Subscription[] = [];
  public item: Item;
  public submissionErrors: SubmissionError;
  public submissionId: string;
  private itemLink$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  public collectionId: string;
  public selfUrl: string;
  @Input() type: string; 
  public sections: WorkspaceitemSectionsObject;
  public submissionDefinition: SubmissionDefinitionsModel;
  fileList1: any[];
  
  setFileList(event: FileList) {
    this.fileList1 = [];
    console.log(event);
    let names = Array.from(event).map(f => f.name);
    let sizes = Array.from(event).map(f => f.size)
    let obj ={}
    for(let i=0;i<names.length;i++){
      obj = {
        name: names[i].substr(0, names[i].lastIndexOf('.')),
        size: sizes[i],
        format:names[i].split('.').pop(),
        description: '-'
      }
      console.log(obj);
      this.fileList1.push(obj);
      this.hwsService.updateselectedFileList(JSON.stringify(this.fileList1));
    }
    // this.fileList1 = 
    
  }
  closeModal() {
    this.activeModal.close();
  }

  
  ngOnInit() {
    this.knowledgeAreaFormGroup = this._formBuilder.group({
      knowledgeAreaCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.thirdFormGroup = this._formBuilder.group({
      thirdCtrl: ['', Validators.required]
    });
    this.fourthFormGroup = this._formBuilder.group({
      fourthCtrl: ['', Validators.required]
    });
    this.getSelectedKA();
  }

  done() {
    this.completed = true;
    this.state = 'done';
    console.log(this.knowledgeAreaFormGroup.valid);
    console.log(this.secondFormGroup.valid);
  }

  ngAfterViewInit() {
    this.stepper.selectionChange
      .pipe(pluck("selectedIndex"))
      .subscribe((res: number) => {
        this.currentState = res;
        console.log(res)
      });
  
  }
  goBack(stepper: MatStepper){
    stepper.previous();
}

goForward(stepper: MatStepper){
  stepper.next();
  if(this.currentState == 1) {
    this.submissionService.createSubmission(JSON.parse(this.selectedknowledgeArea))
    .subscribe((submissionObject: SubmissionObject) => {
      console.log(submissionObject);
      
      // NOTE new submission is created on the browser side only
      if (isNotNull(submissionObject)) {
        if (isEmpty(submissionObject)) {
          console.log('throw error');
          
          // this.notificationsService.info(null, this.translate.get('submission.general.cannot_submit'));
          // this.router.navigate(['/mydspace']);
        } else {
          // this.submissionService.retrieveSubmissionById
          // this.location.replaceState("/workspaceitems/"+submissionObject.id+'/edit');
          // this.location.go("/workspaceitems/"+submissionObject.id+'/edit')
          // window.location.replace("/workspaceitems/"+submissionObject.id+'/edit');
          // this.router.navigate(['/workspaceitems', submissionObject.id, 'edit'], { replaceUrl: true});
          this.collectionModifiable = this.route.snapshot.data?.collectionModifiable ?? null;

          this.submissionService.retrieveSubmission(submissionObject.id).subscribe((submissionObjectRD: RemoteData<SubmissionObject>) => {
            if (submissionObjectRD.hasSucceeded) {
              if (isEmpty(submissionObjectRD.payload)) {
                console.log('throw error');
                
                // this.notificationsService.info(null, this.translate.get('submission.general.cannot_submit'));
                // this.router.navigate(['/mydspace']);
              } else {
                const { errors } = submissionObjectRD.payload;
                this.submissionErrors = parseSectionErrors(errors);
                this.submissionId = submissionObjectRD.payload.id.toString();
                this.collectionId = (submissionObjectRD.payload.collection as Collection).id;
                this.selfUrl = submissionObjectRD.payload._links.self.href;
                this.sections = submissionObjectRD.payload.sections;
                this.itemLink$.next(submissionObjectRD.payload._links.item.href);
                this.item = submissionObjectRD.payload.item;
                this.submissionDefinition = (submissionObjectRD.payload.submissionDefinition as SubmissionDefinitionsModel);
              }
            } else {
              if (submissionObjectRD.statusCode === 404) {
                // redirect to not found page
                console.log('navigate to 404');
                
                // this.router.navigate(['/404'], { skipLocationChange: true });
              }
              // TODO handle generic error
            }
          }),
          this.itemLink$.pipe(
            isNotEmptyOperator(),
            switchMap((itemLink: string) =>
              this.itemDataService.findByHref(itemLink)
            ),
            getAllSucceededRemoteData(),
            // Multiple sources can update the item in quick succession.
            // We only want to rerender the form if the item is unchanged for some time
            debounceTime(300),
          ).subscribe((itemRd: RemoteData<Item>) => {
            this.item = itemRd.payload;
            this.changeDetectorRef.detectChanges();
          })
          this.subs.push(
            this.route.paramMap.pipe(
              switchMap((params: ParamMap) => this.submissionService.retrieveSubmission(params.get('id'))),
              // NOTE new submission is retrieved on the browser side only, so get null on server side rendering
              filter((submissionObjectRD: RemoteData<SubmissionObject>) => isNotNull(submissionObjectRD))
            ).subscribe((submissionObjectRD: RemoteData<SubmissionObject>) => {
              if (submissionObjectRD.hasSucceeded) {
                if (isEmpty(submissionObjectRD.payload)) {
                  console.log('throw error');
                  
                  // this.notificationsService.info(null, this.translate.get('submission.general.cannot_submit'));
                  // this.router.navigate(['/mydspace']);
                } else {
                  const { errors } = submissionObjectRD.payload;
                  this.submissionErrors = parseSectionErrors(errors);
                  this.submissionId = submissionObjectRD.payload.id.toString();
                  this.collectionId = (submissionObjectRD.payload.collection as Collection).id;
                  this.selfUrl = submissionObjectRD.payload._links.self.href;
                  this.sections = submissionObjectRD.payload.sections;
                  this.itemLink$.next(submissionObjectRD.payload._links.item.href);
                  this.item = submissionObjectRD.payload.item;
                  this.submissionDefinition = (submissionObjectRD.payload.submissionDefinition as SubmissionDefinitionsModel);
                }
              } else {
                if (submissionObjectRD.statusCode === 404) {
                  // redirect to not found page
                  console.log('navigate to 404');
                  
                  // this.router.navigate(['/404'], { skipLocationChange: true });
                }
                // TODO handle generic error
              }
            }),
            this.itemLink$.pipe(
              isNotEmptyOperator(),
              switchMap((itemLink: string) =>
                this.itemDataService.findByHref(itemLink)
              ),
              getAllSucceededRemoteData(),
              // Multiple sources can update the item in quick succession.
              // We only want to rerender the form if the item is unchanged for some time
              debounceTime(300),
            ).subscribe((itemRd: RemoteData<Item>) => {
              this.item = itemRd.payload;
              this.changeDetectorRef.detectChanges();
            }),
          );
        } 
      }
    })
  // this.itemLink$.pipe(
  //   isNotEmptyOperator(),
  //   switchMap((itemLink: string) =>
  //     this.itemDataService.findByHref(itemLink)
  //   ),
  //   getAllSucceededRemoteData(),
  //   // Multiple sources can update the item in quick succession.
  //   // We only want to rerender the form if the item is unchanged for some time
  //   debounceTime(300),
  // ).subscribe((itemRd: RemoteData<Item>) => {
  //   this.item = itemRd.payload;
  //   this.changeDetectorRef.detectChanges();
  // })
  }
}

getSelectedKA() {
  this.hwsService.selectedKAdata.subscribe((res:any) => {
    console.log(res)
    if(res != '' && res != null){
      this.selectedknowledgeArea = res
      this.knowledgeAreaFormGroup.controls['knowledgeAreaCtrl'].setValue(this.selectedknowledgeArea);
    }
  })
}

saveAsDraft() {
  
}
}

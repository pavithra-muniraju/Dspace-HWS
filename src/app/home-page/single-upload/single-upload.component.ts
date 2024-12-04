import { ChangeDetectorRef, Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of as observableOf } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatStepper } from "@angular/material/stepper";
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, map, Observable, pluck, Subscription, switchMap } from 'rxjs';
import { HWSService } from 'src/app/HWS-Shared/hws.service';
import { SubmissionService } from 'src/app/submission/submission.service';
import { SubmissionObject } from 'src/app/core/submission/models/submission-object.model';
import { hasValue, isEmpty, isNotEmpty, isNotEmptyOperator, isNotNull, isNotUndefined } from 'src/app/shared/empty.util';
import { Location } from '@angular/common';
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
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { UploaderOptions } from 'src/app/shared/upload/uploader/uploader-options.model';
import { SubmissionObjectEntry } from 'src/app/submission/objects/submission-objects.reducer';
import { SectionDataObject } from 'src/app/submission/sections/models/section-data.model';

import isEqual from 'lodash/isEqual';
import { AuthService } from 'src/app/core/auth/auth.service';
import { HALEndpointService } from 'src/app/core/shared/hal-endpoint.service';
import { SectionsService } from 'src/app/submission/sections/sections.service';
import { SectionsType } from 'src/app/submission/sections/sections-type';
import { SubmissionSectionModel, SubmissionSectionVisibility } from 'src/app/core/config/models/config-submission-section.model';
import { VisibilityType } from 'src/app/submission/sections/visibility-type';
import { Store } from '@ngrx/store';
import { submissionObjectFromIdSelector } from 'src/app/submission/selectors';

@Component({
  selector: 'ds-single-upload',
  templateUrl: './single-upload.component.html',
  styleUrls: ['./single-upload.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class SingleUploadComponent {
  @ViewChild("stepper", { static: false }) private stepper: MatStepper;
  collectionModifiable: any;
  qaMetadatafields = []

  selectedItemId = 0
  isActive: boolean;
  submissionSections: Observable<unknown>;
  metadata = '';


  constructor(
    private activeModal: NgbActiveModal,
    private _formBuilder: FormBuilder,
    private hwsService: HWSService,
    private submissionService: SubmissionService,
    private location: Location,
    private route: ActivatedRoute,
    private itemDataService: ItemDataService,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationService: NotificationsService,
    private authService: AuthService,
    private halService: HALEndpointService,
    private sectionsService: SectionsService,
    private store: Store<any>
  ) { }

  knowledgeAreaFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;
  completed: boolean = false;
  state: string;
  currentState = 0;

  selectedknowledgeArea = ''

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
uploadLink = ''
  public uploadEnabled$: Observable<boolean>;
  public uploadFilesOptions: UploaderOptions = new UploaderOptions();
  public loading: Observable<boolean> = observableOf(true);
  public definitionId: string;

  sectionObjForFileList: any;
  selectedDepartment = ''
  setFileList(event: FileList) {
    this.fileList1 = [];
    console.log(event);
    let names = Array.from(event).map(f => f.name);
    let sizes = Array.from(event).map(f => f.size)
    let obj = {}
    for (let i = 0; i < names.length; i++) {
      obj = {
        name: names[i].substr(0, names[i].lastIndexOf('.')),
        size: sizes[i],
        format: names[i].split('.').pop(),
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
    this.selectedknowledgeArea = '';
    this.selectedDepartment = '';
    this.knowledgeAreaFormGroup = this._formBuilder.group({
      knowledgeAreaCtrl: ['', Validators.required],
      departmentCtrl: ['', Validators.required]
    });

    this.thirdFormGroup = this._formBuilder.group({
      thirdCtrl: ['', Validators.required]
    });
    this.fourthFormGroup = this._formBuilder.group({
      fourthCtrl: ['', Validators.required]
    });
    // this.secondFormGroup = this._formBuilder.group({
    //   secondCtrl: ['', Validators.required]
    // });
    this.getSelectedKA();
    this.secondFormGroup = this.setDescFormControl();


  }

  done() {
    this.completed = true;
    this.state = 'done';
    console.log(this.knowledgeAreaFormGroup.valid);
    console.log(this.secondFormGroup.valid);
    this.submissionService.dispatchDeposit(this.submissionId);
    this.closeModal();
  }

  ngAfterViewInit() {
    this.stepper.selectionChange
      .pipe(pluck("selectedIndex"))
      .subscribe((res: number) => {
        this.currentState = res;
        console.log(res)
      });

  }
  goBack(stepper: MatStepper) {
    stepper.previous();
    this.hwsService.updatecurrentState(JSON.stringify(this.currentState));

    let data = this.store.select(submissionObjectFromIdSelector(this.submissionId)).pipe(
      filter((submission: SubmissionObjectEntry) => isNotUndefined(submission)));
    data.subscribe(res => {
      console.log(res);
    })
  }

  goForward(stepper: MatStepper) {
    // if(this.currentState == 0){
    //   this.checkForms();
    // } 
    stepper.next();
    this.hwsService.updatecurrentState(JSON.stringify(this.currentState));
    if (this.currentState == 1) {
      this.submissionService.createSubmission(JSON.parse(this.selectedDepartment))
        .subscribe((submissionObject: SubmissionObject) => {
          console.log(submissionObject);

          // NOTE new submission is created on the browser side only
          if (isNotNull(submissionObject)) {
            if (isEmpty(submissionObject)) {
              console.log('throw error');
            } else {
              this.collectionModifiable = this.route.snapshot.data?.collectionModifiable ?? null;
              this.selectedItemId = parseInt(submissionObject.id);

              this.submissionService.retrieveSubmission(submissionObject.id).subscribe((submissionObjectRD: RemoteData<SubmissionObject>) => {
                console.log(submissionObjectRD)
                if (submissionObjectRD.hasSucceeded) {
                  if (isEmpty(submissionObjectRD.payload)) {
                    console.log('throw error');

                    // this.notificationsService.info(null, this.translate.get('submission.general.cannot_submit'));
                    // this.router.navigate(['/mydspace']);
                  } else {
                    const { errors } = submissionObjectRD.payload;
                    this.submissionErrors = parseSectionErrors(errors);
                    this.submissionId = submissionObjectRD.payload.id.toString();
                    this.submissionSections = this.submissionService.getSubmissionObject(this.submissionId).pipe(
                      filter(() => this.isActive),
                      map((submission: SubmissionObjectEntry) => submission.isLoading),
                      map((isLoading: boolean) => isLoading),
                      distinctUntilChanged(),
                      switchMap((isLoading: boolean) => {
                        if (!isLoading) {
                          return this.getSectionsList();
                        } else {
                          return observableOf([]);
                        }
                      }));
                      this.submissionSections.subscribe(res => {
                        console.log('resss',res);
                      })
                      console.log(this.submissionSections.subscribe());
                    this.collectionId = (submissionObjectRD.payload.collection as Collection).id;
                    this.selfUrl = submissionObjectRD.payload._links.self.href;
                    this.sections = submissionObjectRD.payload.sections;
                    let sectionkeys = Object.keys(this.sections);
                    let workflowName = '';
                    sectionkeys.forEach(ele => {
                      if (ele.indexOf('workflow') !== -1) {
                        workflowName = ele
                      }
                    }); 
                    this.metadata = workflowName;
                    // this.qaMetadatafields =            
                    this.itemLink$.next(submissionObjectRD.payload._links.item.href);
                    this.item = submissionObjectRD.payload.item;
                    this.submissionDefinition = (submissionObjectRD.payload.submissionDefinition as SubmissionDefinitionsModel);
                    this.submissionSections = this.submissionService.getSubmissionObject(this.submissionId).pipe(
                      filter(() => this.isActive),
                      map((submission: SubmissionObjectEntry) => submission.isLoading),
                      map((isLoading: boolean) => isLoading),
                      distinctUntilChanged(),
                      switchMap((isLoading: boolean) => {
                        if (!isLoading) {
                          return this.getSectionsList();
                        } else {
                          return observableOf([]);
                        }
                      }));
                      this.submissionSections.subscribe(res => {
                        console.log('resss',res);
                      })

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
                  console.log(this.item)
                  this.changeDetectorRef.detectChanges();
                })
            }
          }
        });
    }
    let data = this.store.select(submissionObjectFromIdSelector(this.submissionId)).pipe(
      filter((submission: any) => isNotUndefined(submission)));
    data.subscribe(res => {
      console.log(res);
      this.uploadLink = res?.sections?.upload?.config;
      this.fileList1 = res?.sections?.upload?.data?.files || []
      if (this.currentState == 2) {
        this.sectionObjForFileList = res;
      }
    });

  }

  getSelectedKA() {
    this.hwsService.selectedKAdata.subscribe((res: any) => {
      console.log(res)
      if (res != '' && res != null) {
        this.selectedDepartment = res
        this.knowledgeAreaFormGroup.controls['departmentCtrl'].setValue(this.selectedDepartment);
      }
    })
  }

  saveAsDraft() {
    
    this.submissionService.dispatchSaveForLater(this.submissionId);
    this.closeModal();
  }

  
  saveAsDraft11() {
    console.log(this.secondFormGroup.value);

    let keys = this.qaMetadatafields.map(item => item.fields[0].label);
    console.log(keys);
    let payload = [];
    if (this.secondFormGroup.valid) {
      keys.forEach(element => {
        let objFormat = {
          "op": "add",
          "path": "",
          "value": {
            "value": "",
            "language": null,
            "authority": null,
            "display": "",
            "confidence": -1,
            "place": 0,
            "otherInformation": null
          }
        }
        if (this.secondFormGroup.controls[element].value != "") {
          console.log(this.secondFormGroup.controls[element].value)
          objFormat.value.value = this.secondFormGroup.controls[element].value;
          objFormat.value.display = this.secondFormGroup.controls[element].value;
          payload.push(objFormat)
          let metadatafield: any = this.qaMetadatafields.filter(item => item.fields[0].label == element)
          objFormat.path = "/sections/qaworkflowmetadataStep/" + metadatafield[0].fields[0].selectableMetadata[0].metadata + '/0'
        }
      })
    } else {
      this.notificationService.error('Please fill all the mandatory fields')
    }
    console.log(payload);
    this.submissionService.saveForLater(JSON.stringify(payload), this.selectedItemId).subscribe(res => {
      console.log(res);

    })
  }

  setDescFormControl() {
    const group: any = {};
    this.qaMetadatafields.forEach(element => {
      group[element.fields[0].label] = element.fields[0].mandatory
        ? new FormControl('', Validators.required)
        : new FormControl('');
    });
    return new FormGroup(group);
  }



cancel() {
  this.submissionService.dispatchDiscard(this.submissionId);
  this.closeModal();
}

  /**
   * Initialize all instance variables and retrieve form configuration
   */
  ngOnChanges(changes: SimpleChanges) {
    if ((changes.collectionId && this.collectionId) && (changes.submissionId && this.submissionId)) {
      this.isActive = true;

      // retrieve submission's section list
      this.submissionSections = this.submissionService.getSubmissionObject(this.submissionId).pipe(
        filter(() => this.isActive),
        map((submission: SubmissionObjectEntry) => submission.isLoading),
        map((isLoading: boolean) => isLoading),
        distinctUntilChanged(),
        switchMap((isLoading: boolean) => {
          if (!isLoading) {
            return this.getSectionsList();
          } else {
            return observableOf([]);
          }
        }));
        this.submissionSections.subscribe(res => {
          console.log(res);
        })
      this.uploadEnabled$ = this.sectionsService.isSectionTypeAvailable(this.submissionId, SectionsType.Upload);

      // check if is submission loading
      this.loading = this.submissionService.getSubmissionObject(this.submissionId).pipe(
        filter(() => this.isActive),
        map((submission: SubmissionObjectEntry) => submission.isLoading),
        map((isLoading: boolean) => isLoading),
        distinctUntilChanged());

      // init submission state
      this.subs.push(
        this.halService.getEndpoint(this.submissionService.getSubmissionObjectLinkName()).pipe(
          filter((href: string) => isNotEmpty(href)),
          distinctUntilChanged())
          .subscribe((endpointURL) => {
            this.uploadFilesOptions.authToken = this.authService.buildAuthHeader();
            this.uploadFilesOptions.url = endpointURL.concat(`/${this.submissionId}`);
            this.definitionId = this.submissionDefinition.name;
            this.submissionService.dispatchInit(
              this.collectionId,
              this.submissionId,
              this.selfUrl,
              this.submissionDefinition,
              this.sections,
              this.item,
              this.submissionErrors);
            this.changeDetectorRef.detectChanges();
          })
      );

      // start auto save
      this.submissionService.startAutoSave(this.submissionId);
      this.submissionService.getSubmissionObject(this.submissionId).subscribe(res => {
        console.log(res);
      })
    }
    this.submissionSections = this.submissionService.getSubmissionObject(this.submissionId).pipe(
      filter(() => this.isActive),
      map((submission: SubmissionObjectEntry) => submission.isLoading),
      map((isLoading: boolean) => isLoading),
      distinctUntilChanged(),
      switchMap((isLoading: boolean) => {
        if (!isLoading) {
          return this.getSectionsList();
        } else {
          return observableOf([]);
        }
      }));
     this.submissionSections.subscribe(res => {
       console.log('ress',res);
     })
  }

  /**
   *  Returns the visibility object of the collection section
   */
  private getCollectionVisibility(): SubmissionSectionVisibility {
    const submissionSectionModel: SubmissionSectionModel =
      this.submissionDefinition?.sections?.page.find(
        (section) => isEqual(section.sectionType, SectionsType.Collection)
      );

    return isNotUndefined(submissionSectionModel?.visibility) ? submissionSectionModel.visibility : null;
  }

  /**
   * Getter to see if the collection section visibility is hidden
   */
  get isSectionHidden(): boolean {
    const visibility = this.getCollectionVisibility();
    if (visibility != null) {
      return (
        hasValue(visibility) &&
        isEqual(visibility.main, VisibilityType.HIDDEN) &&
        isEqual(visibility.other, VisibilityType.HIDDEN)
      );
    }

  }

  /**
   * Getter to see if the collection section visibility is readonly
   */
  get isSectionReadonly(): boolean {
    const visibility = this.getCollectionVisibility();
    return (
      hasValue(visibility) &&
      isEqual(visibility.main, VisibilityType.READONLY) &&
      isEqual(visibility.other, VisibilityType.READONLY)
    );
  }

  /**
   * Unsubscribe from all subscriptions, destroy instance variables
   * and reset submission state
   */
  ngOnDestroy() {
    this.isActive = false;
    this.submissionService.stopAutoSave();
    this.submissionService.resetAllSubmissionObjects();
    this.subs
      .filter((subscription) => hasValue(subscription))
      .forEach((subscription) => subscription.unsubscribe());
  }

  /**
   * On collection change reset submission state in case of it has a different
   * submission definition
   *
   * @param submissionObject
   *    new submission object
   */
  onCollectionChange(submissionObject: SubmissionObject) {
    this.collectionId = (submissionObject.collection as Collection).id;
    if (this.definitionId !== (submissionObject.submissionDefinition as SubmissionDefinitionsModel).name) {
      this.sections = submissionObject.sections;
      this.submissionDefinition = (submissionObject.submissionDefinition as SubmissionDefinitionsModel);
      this.definitionId = this.submissionDefinition.name;
      this.submissionService.resetSubmissionObject(
        this.collectionId,
        this.submissionId,
        submissionObject._links.self.href,
        this.submissionDefinition,
        this.sections,
        this.item);
    } else {
      this.changeDetectorRef.detectChanges();
    }
  }

  /**
   * Check if submission form is loading
   */
  isLoading(): Observable<boolean> {
    return this.loading;
  }

  /**
   * Check if submission form is loading
   */
  protected getSectionsList(): Observable<any> {
    return this.submissionService.getSubmissionSections(this.submissionId).pipe(
      filter((sections: SectionDataObject[]) => isNotEmpty(sections)),
      map((sections: SectionDataObject[]) =>
        sections.filter((section: SectionDataObject) => !isEqual(section.sectionType, SectionsType.Collection))),
    );
  }

  getqasectionList() {
    
  }

  checkForms() {
    if(this.currentState == 0) {
      if(this.selectedknowledgeArea == '' || this.selectedDepartment == ''){
        return true
      } else {
        return false
      }
    }
    if(this.currentState == 2 || this.currentState == 2) {
      this.hwsService.fileUploadedData.subscribe(res => {
        if(res != 'true') {
          return true
        } else {
          return false
        }
      })
    }
  }

}

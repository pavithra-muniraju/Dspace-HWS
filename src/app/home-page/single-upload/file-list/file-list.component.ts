import { Component, Input, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource, } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { filter, map, Observable, switchMap } from 'rxjs';
import { SubmissionFormsModel } from 'src/app/core/config/models/config-submission-forms.model';
import { SubmissionUploadsModel } from 'src/app/core/config/models/config-submission-uploads.model';
import { SubmissionUploadsConfigDataService } from 'src/app/core/config/submission-uploads-config-data.service';
import { RemoteData } from 'src/app/core/data/remote-data';
import { JsonPatchOperationPathCombiner } from 'src/app/core/json-patch/builder/json-patch-operation-path-combiner';
import { JsonPatchOperationsBuilder } from 'src/app/core/json-patch/builder/json-patch-operations-builder';
import { MetadataMap, MetadataValue } from 'src/app/core/shared/metadata.models';
import { Metadata } from 'src/app/core/shared/metadata.utils';
import { getFirstSucceededRemoteData } from 'src/app/core/shared/operators';
import { SubmissionObject } from 'src/app/core/submission/models/submission-object.model';
import { WorkspaceitemSectionUploadObject } from 'src/app/core/submission/models/workspaceitem-section-upload.model';
import { SubmissionJsonPatchOperationsService } from 'src/app/core/submission/submission-json-patch-operations.service';
import { HWSService } from 'src/app/HWS-Shared/hws.service';
import { isNotEmpty, isNotUndefined } from 'src/app/shared/empty.util';
import { FormFieldMetadataValueObject } from 'src/app/shared/form/builder/models/form-field-metadata-value.model';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { SectionUploadService } from 'src/app/submission/sections/upload/section-upload.service';
import { submissionObjectFromIdSelector } from 'src/app/submission/selectors';
import { SubmissionService } from 'src/app/submission/submission.service';

// export interface PeriodicElement {
//   name: string;
//   position: number;
//   weight: number;
//   symbol: string;
// }

// const ELEMENT_DATA: PeriodicElement[] = [
//   { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
//   { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
//   { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
//   { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
//   { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
//   { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
//   { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
//   { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
//   { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
//   { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
//   { position: 11, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
// ];

@Component({
  selector: 'ds-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent {
  @Input() fileList = []
  @Input() submissionId = '';
  @Input() collectionId = '';
  @Input() uploadLink = '';
  displayedColumns: string[] = ['File Name', 'Size', 'Description', 'Format', 'Action'];
  dataSource = new MatTableDataSource<any>();
  fileIndexes = [];
  fileNames = [];
  availableAccessConditionOptions = []
  public metadata: MetadataMap = Object.create({});
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public configMetadataForm$: Observable<SubmissionFormsModel>;

  isLoading = true;
  descriptionDropdown = [
    "Section",
    "Project Code",
    "MLH Category",
    "Reference DCR/ECN/PTS",
    "Occurrence (ppm/numbers)",
    "Issue Description",
    "Issue Category",
    "Associated parts and their application",
    "Impact",
    "First time design for Hero",
    "Analysis/Observations for root cause",
    "Root Cause",
    "Identified Countermeasure",
    "Verification results of countermeasure",
    "Type of countermeasure",
    "Design control to avoid in future development",
    "Detection control (additional test/poka-yoke)",
    "Check done for horizontal deployment (Model Name)",
    "Same specification in MP model (Model Name)",
    "Associated Test standard/Design guideline number",
    "Why not detected at earlier stage",
    "Issue Source",
    "Reported Stage"
  ]
  sectionData:any;
  pageNumber: number = 1;
  VOForm: FormGroup;
  isEditableNew: boolean = true;
  pathCombiner: JsonPatchOperationPathCombiner;
  constructor(
    private fb: FormBuilder,
    private _formBuilder: FormBuilder,
    private hwsService: HWSService,
    private uploadService: SectionUploadService,
    private operationsBuilder: JsonPatchOperationsBuilder,
    private submissionService: SubmissionService,
    private uploadsConfigService: SubmissionUploadsConfigDataService,
    private operationsService: SubmissionJsonPatchOperationsService,
    private store: Store<any>
  ) { }

  ngOnInit(): void {

    const config$ = this.uploadsConfigService.findByHref(this.uploadLink, true, false, followLink('metadata')).pipe(
      getFirstSucceededRemoteData(),
      map((config) => config.payload));

    // retrieve configuration for the bitstream's metadata form
    this.configMetadataForm$ = config$.pipe(
      switchMap((config: SubmissionUploadsModel) =>
        config.metadata.pipe(
          getFirstSucceededRemoteData(),
          map((remoteData: RemoteData<SubmissionFormsModel>) => remoteData.payload)
        )
      ));


    // this.sectionData.id = 'upload'
    // let fileListFromRre:any
    // this.hwsService.selectedFileListdata?.subscribe(res => {
    //   console.log(res);
    //   fileListFromRre = JSON.parse(res)
    // })
//not used
    console.log(this.fileList)
    this.VOForm = this._formBuilder.group({
      VORows: this._formBuilder.array([])
    });
    if (this.fileList != undefined) {
      if (this.fileList.length > 0) {

//not used
        this.VOForm = this.fb.group({
          VORows: this.fb.array(this.fileList.map(val => this.fb.group({

            name: new FormControl(val.metadata['dc.title'][0].value),
            size: new FormControl(val.sizeBytes),
            description: new FormControl('-'),
            format: new FormControl(val.format.extensions[0]),
            action: new FormControl('existingRecord'),
            isEditable: new FormControl(true),
            isNewRow: new FormControl(false),
            uuid: new FormControl(val.uuid)
          })
          )) //end of fb array
        }); // end of form group cretation
        this.isLoading = false;
        this.dataSource = new MatTableDataSource((this.VOForm.get('VORows') as FormArray).controls);
        this.dataSource.paginator = this.paginator;
      }
    }

    this.fileList.forEach((file) => {
      // this.fileList.push(file);
      this.fileIndexes.push(file.uuid);
      this.fileNames.push(file.metadata['dc.title'][0].value, file);
    });
    this.getsubmissionobj();
  }

  // this function will enabled the select field for editd
  EditSVO(VOFormElement, i) {
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(false);
  }

  // On click of correct button in table (after click on edit) this method will call
  SaveVO(VOFormElement, i) {
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(true);
    console.log(this.dataSource.data[i]);
    let data = JSON.parse(JSON.stringify(this.fileList.filter(item => item.uuid == this.dataSource.data[i].value.uuid)));
    if (data.length > 0 || data != undefined) {
      let obj2 = 
        {
          "value": this.dataSource.data[i].value.description,
          "language": null,
          "authority": null,
          "display": this.dataSource.data[i].value.description,
          "confidence": -1,
          "place": 0,
          "otherInformation": null
        }
        data[0].metadata['dc.description'] = [];
        
      data[0].metadata['dc.description'][0] = obj2;
      let sectionId = 'upload';
      let fileId = data[0].uuid
      console.log(data);
      // this.operationsService.jsonPatchByResourceID(
      //       this.submissionService.getSubmissionObjectLinkName(),
      //       this.submissionId,
      //      'sections',
      //       'upload/files/0');
      // this.uploadService.updateFileData(
      //   this.submissionId, sectionId, fileId, data[0]
      //   )};

      //   {
      //     "parts": [
      //         "sections",
      //         "upload",
      //         "files",
      //         0
      //     ],
      //     "_rootElement": "sections",
      //     "_subRootElement": "upload/files/0"
      // }
      const uploadedData = data.map((formData: any) => {
        // collect bitstream metadata
        Object.keys((formData.metadata))
          .filter((key) => isNotEmpty(formData.metadata[key]))
          .forEach((key) => {
            const metadataKey = key.replace(/_/g, '.');
            const path = `metadata/${metadataKey}`;
            this.operationsBuilder.add(this.pathCombiner.getPath(path), formData.metadata[key], true);
          });

        // dispatch a PATCH request to save metadata
        return this.operationsService.jsonPatchByResourceID(
          this.submissionService.getSubmissionObjectLinkName(),
          this.submissionId,
          this.pathCombiner.rootElement,
          this.pathCombiner.subRootElement);
      }).subscribe((result: SubmissionObject[]) => {
        if (result[0].sections[sectionId]) {
          const uploadSection = (result[0].sections[sectionId] as WorkspaceitemSectionUploadObject);
          Object.keys(uploadSection.files)
            .filter((key) => uploadSection.files[key].uuid === fileId)
            .forEach((key) => this.uploadService.updateFileData(
              this.submissionId, sectionId, fileId, uploadSection.files[key])
            );
        }
      });}
      // Object.keys((data[0].metadata))
      //     .filter((key) => isNotEmpty(data[0].metadata[key]))
      //     .forEach((key) => {
      //       const metadataKey = key.replace(/_/g, '.');
      //       const path = `metadata/${metadataKey}`;
      //       this.operationsBuilder.add(this.pathCombiner.getPath(path), (data[0].metadata[key], true),
      //     });}
      
  }
//not used
  // On click of cancel button in the table (after click on edit) this method will call and reset the previous data
  CancelSVO(VOFormElement, i) {
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(true);
  }
//not used
  deleteRow(index: number) {
    const data = this.dataSource.data;
    data.splice(index, 1);

    this.dataSource.data = data;
  }
//not used
  cancelRow(row, i) {
    // if (type !== 'delete') {
    row.isEditable = false;
    // cancel - reset form control values to data object
    Object.keys(row.validator.controls).forEach(item => {
      row.validator.controls[item].patchValue(row.currentData[item]);
    });
    // }
  }

  getAllMetadataValue(metadataKey: string): MetadataValue[] {
    return Metadata.all(this.metadata, metadataKey);
  }

  getsubmissionobj(){
    let data = this.store.select(submissionObjectFromIdSelector(this.submissionId)).pipe(
      filter((submission: any) => isNotUndefined(submission)));
    data.subscribe(res => {
      console.log(res);
      this.fileList = res?.sections?.upload?.data?.files 
    });
  }

  getDesc(filedata) {
    if(filedata.metadata['dc.description'] != undefined) {
      return filedata.metadata['dc.description'][0].value
    } 
    return 'None'
  }

  getFormat(name) {
    let format = name.split('.');
    return format[format.length - 1];
  }
}


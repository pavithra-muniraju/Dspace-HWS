import { Component, Input, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource, } from '@angular/material/table';
import { HWSService } from 'src/app/HWS-Shared/hws.service';
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
  displayedColumns: string[] = ['name', 'size', 'description','format', 'action'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  isLoading = true;

  pageNumber: number = 1;
  VOForm: FormGroup;
  isEditableNew: boolean = true;

  constructor(
    private fb: FormBuilder,
    private _formBuilder: FormBuilder,
    private hwsService: HWSService
    ) { }

  ngOnInit(): void {
    let fileListFromRre:any
    this.hwsService.selectedFileListdata.subscribe(res => {
      console.log(res);
      fileListFromRre = JSON.parse(res)
    })
    
    console.log(this.fileList)
    this.VOForm = this._formBuilder.group({
      VORows: this._formBuilder.array([])
    });
    if(this.fileList != undefined) {
      if(this.fileList.length > 0) {

      
      this.VOForm = this.fb.group({
        VORows: this.fb.array(this.fileList.map(val => this.fb.group({
         
          name: new FormControl(val.name),
          size: new FormControl(val.size),
          description: new FormControl(val.description),
          format: new FormControl(val.format),
          action: new FormControl('existingRecord'),
          isEditable: new FormControl(true),
          isNewRow: new FormControl(false),
        })
        )) //end of fb array
      }); // end of form group cretation
      this.isLoading = false;
      this.dataSource = new MatTableDataSource((this.VOForm.get('VORows') as FormArray).controls);
      this.dataSource.paginator = this.paginator;
    } }
  }

  // this function will enabled the select field for editd
  EditSVO(VOFormElement, i) {
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(false);
  }

  // On click of correct button in table (after click on edit) this method will call
  SaveVO(VOFormElement, i) {
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(true);
  }

  // On click of cancel button in the table (after click on edit) this method will call and reset the previous data
  CancelSVO(VOFormElement, i) {
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(true);
  }

  deleteRow(index: number) {
    const data = this.dataSource.data;
    data.splice(index, 1);

    this.dataSource.data = data;
  }

  cancelRow(row, i) {
    // if (type !== 'delete') {
      row.isEditable = false;
      // cancel - reset form control values to data object
      Object.keys(row.validator.controls).forEach(item => {
        row.validator.controls[item].patchValue(row.currentData[item]);
      });
    // }
  }
}

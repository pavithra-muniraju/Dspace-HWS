import { Component } from '@angular/core';
import { apiUrl } from './../../../../src/config/apiUrl';

@Component({
  selector: 'ds-user-manual',
  templateUrl: './user-manual.component.html',
  styleUrls: ['./user-manual.component.scss']
})
export class UserManualComponent {

  pdfSrc= apiUrl.pdfView
  loading:boolean = true;

  onPdfLoadComplete(pdf: any): void {
    this.loading = false
  }

}

import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { apiUrl } from './../../../../src/config/apiUrl';

@Component({
  selector: 'ds-user-manual',
  templateUrl: './user-manual.component.html',
  styleUrls: ['./user-manual.component.scss']
})
export class UserManualComponent {
  constructor(
    private activeModal: NgbActiveModal,
  ) { }

  pdfSrc= apiUrl.pdfView;
  loading:boolean = true;
  @Input() content: string; 
  @Input() header: string; 

  closeModal() {
    this.activeModal.close();
  }

  onPdfLoadComplete(pdf: any): void {
    this.loading = false
  }

}

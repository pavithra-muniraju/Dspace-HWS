import { Component } from '@angular/core';
import { Observable, take } from 'rxjs';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { HwsAboutComponent } from 'src/app/hws-about/hws-about.component';

@Component({
  selector: 'ds-hws-footer',
  templateUrl: './hws-footer.component.html',
  styleUrls: ['./hws-footer.component.scss']
})
export class HwsFooterComponent {
  aboutModal = false;

  constructor(
    private modalService: NgbModal,
    private modalConfig: NgbModalConfig,
  ) { }

  hwsFooterAction(msg:string) {
    this.aboutModal = false;
    const modalRef = this.modalService.open(HwsAboutComponent,
      { ariaLabelledBy: 'idle-modal.header' });
    this.aboutModal = true;
    modalRef.componentInstance.content = msg; 
    modalRef.componentInstance.response.pipe(take(1)).subscribe((closed: boolean) => {
      if (closed) {
        this.aboutModal = false;
      }
    });
  }

}

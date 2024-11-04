import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ds-hws-about',
  templateUrl: './hws-about.component.html',
  styleUrls: ['./hws-about.component.scss']
})
export class HwsAboutComponent {
  constructor(
    private activeModal: NgbActiveModal,
  ) { }

  @Input() content: string; 

  closeModal() {
    this.activeModal.close();
  }
}

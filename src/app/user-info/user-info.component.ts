import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { EPerson } from '../core/eperson/models/eperson.model';
import { DSONameService } from '../core/breadcrumbs/dso-name.service'

@Component({
  selector: 'ds-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent {
  constructor(
    private activeModal: NgbActiveModal,
    public dsoNameService: DSONameService,
  ) { }

  userFirstName = ''
  userLastName = ''
  userEmail = ''

  @Input() user$:Observable<EPerson>

  ngOnInit() {
    this.user$.subscribe(res => {
      console.log(res);
      this.userEmail = res.email;
      this.userFirstName = res.metadata['eperson.firstname'][0].value
      this.userLastName = res.metadata['eperson.lastname'][0].value
      console.log(res.email)
    })
  }

  closeModal() {
    this.activeModal.close();
  }
}
 
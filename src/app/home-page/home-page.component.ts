import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, take } from 'rxjs';
import { Site } from '../core/shared/site.model';
import { environment } from '../../environments/environment';
import { AppState } from '../app.reducer';
import { isAuthenticated, isAuthenticationLoading } from '../core/auth/selectors';
import { select, Store } from '@ngrx/store';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { SingleUploadComponent } from './single-upload/single-upload.component';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'ds-home-page',
  styleUrls: ['./home-page.component.scss'],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent implements OnInit {
  site$: Observable<Site>;
  recentSubmissionspageSize: number;

  public isAuthenticated: Observable<boolean>;
  public showAuth = false;
  isLoginAuthenticated  = false;

  
  searchPlaceholder: string = 'Type Keyword, Section, Unit or Project Code to Search';

  query:string = '';

  brandColor = 'primary';
  singleUpload = false
  constructor(
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private router: Router,
    private modalService: NgbModal,
    private authService: AuthService,
  ) {
    this.recentSubmissionspageSize = environment.homePage.recentSubmissions.pageSize;
  }

  ngOnInit(): void {
    this.site$ = this.route.data.pipe(
      map((data) => data.site as Site),
    );
    // this.isAuthenticated = this.store.pipe(select(isAuthenticated));

    // this.isAuthenticated.subscribe(res => {
    //   this.isLoginAuthenticated = res;
    //   if(this.isLoginAuthenticated == false) {
        
       
    //   }
    // });

    this.authService.isAuthenticated()
      .subscribe((loggedIn: boolean) => {
        if (!loggedIn) {
          this.router.navigateByUrl('/login');
        }
      });
  }

  onSearch(data: any) {
    const queryParams = Object.assign({}, data);
    this.router.navigate(['search'], {
      queryParams: queryParams
    });
  }

  onSubmit(data) {
    
  }

  uploadtype(type) {
    console.log(type);
    this.singleUpload = false;
    const modalRef = this.modalService.open(SingleUploadComponent,
      { ariaLabelledBy: 'idle-modal.header', windowClass: 'modal-mysize'});
    modalRef.componentInstance.type = type;
    
    modalRef.componentInstance?.response?.pipe(take(1)).subscribe((closed: boolean) => {
      if (closed) {
        this.singleUpload = false;
      }
    });
  }
}

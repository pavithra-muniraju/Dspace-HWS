import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, take } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { EPerson } from 'src/app/core/eperson/models/eperson.model';
import { HWSService } from 'src/app/HWS-Shared/hws.service';
import { MenuService } from 'src/app/shared/menu/menu.service';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service'
// import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/app.reducer';
import { isAuthenticated, isAuthenticationLoading } from '../../core/auth/selectors';
import { HwsAboutComponent } from 'src/app/hws-about/hws-about.component';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ds-hws-header',
  templateUrl: './hws-header.component.html',
  styleUrls: ['./hws-header.component.scss']
})
export class HwsHeaderComponent {
  public user$: Observable<EPerson>;
  currentRoute = ''
  enableLoginHeaders = false;
  isLoggedInAsAdmin = false;
  isLoginAuthenticated = false;
  menuItems = [];
  aboutModal = false;

  public isAuthenticated: Observable<boolean>;
  constructor(private hwsService: HWSService,
    public dsoNameService: DSONameService,
    protected authService: AuthService,
    private store: Store<AppState>,
    private router: Router,
    private modalService: NgbModal,
    private modalConfig: NgbModalConfig,
  ) { }
  ngOnInit() {
    this.isAuthenticated = this.store.pipe(select(isAuthenticated));

    this.isAuthenticated.subscribe(res => {
      console.log(res);
      this.isLoginAuthenticated = res;
      if (this.isLoginAuthenticated == false) {
        console.log(this.router.url)
        // this.router.navigateByUrl('/googlelogin');
        this.router.navigateByUrl('/login');
        // if(this.router.url == '/login' || this.router.url == '/googlelogin') {

        // }
        this.enableLoginHeaders = true

      } else {
        this.user$ = this.authService.getAuthenticatedUserFromStore();
        this.checkForAdminLogin();
        console.log('pavi ' + this.router);
        this.hwsService.shareRouteInfo.subscribe(res => {
          this.currentRoute = res;

          if (this.currentRoute == '/login' || this.currentRoute == '/googlelogin') {
            this.enableLoginHeaders = true
          } else {
            this.enableLoginHeaders = false;
          }
        });
      }
    })



    this.getMenuItems();
  }

  checkForAdminLogin() {
    console.log(this.user$);
    this.user$.subscribe((res: any) => {
      console.log(res);
      console.log(this.dsoNameService.getName(res));
    })


    // this.user$.subscribe(res => {

    // })
    // if(this.user$.subscribe)
  }

  getMenuItems() {
    this.hwsService.getCustomMenuData().subscribe(res => {
      // console.log(res);
      if (res != '' && res != '[]') {
        this.menuItems = JSON.parse(res);
        // console.log(this.menuItems);
        if (this.menuItems.map(item => item.id).includes('access_control')) {
          this.isLoggedInAsAdmin = true;
        } else {
          this.isLoggedInAsAdmin = false;
        }
      };

    })
  }

  hwsAbout() {
    this.aboutModal = false;
    const modalRef = this.modalService.open(HwsAboutComponent,
      { ariaLabelledBy: 'idle-modal.header' });
    this.aboutModal = true;
    modalRef.componentInstance.response.pipe(take(1)).subscribe((closed: boolean) => {
      if (closed) {
        this.aboutModal = false;
      }
    });
  }
}


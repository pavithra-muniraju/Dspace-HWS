import { Component, Injector, OnInit } from '@angular/core';
import { slideMobileNav } from '../shared/animations/slide';
import { MenuComponent } from '../shared/menu/menu.component';
import { MenuService } from '../shared/menu/menu.service';
import { HostWindowService, WidthCategory } from '../shared/host-window.service';
import { BrowseService } from '../core/browse/browse.service';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationDataService } from '../core/data/feature-authorization/authorization-data.service';
import { MenuID } from '../shared/menu/menu-id.model';
import { ThemeService } from '../shared/theme-support/theme.service';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import { isAuthenticated } from '../core/auth/selectors';
import { HWSService } from '../HWS-Shared/hws.service';

/**
 * Component representing the public navbar
 */
@Component({
  selector: 'ds-navbar',
  styleUrls: ['./navbar.component.scss'],
  templateUrl: './navbar.component.html',
  animations: [slideMobileNav]
})
export class NavbarComponent extends MenuComponent implements OnInit {
  /**
   * The menu ID of the Navbar is PUBLIC
   * @type {MenuID.PUBLIC}
   */
  menuID = MenuID.PUBLIC;
  maxMobileWidth = WidthCategory.SM;

  /**
   * Whether user is authenticated.
   * @type {Observable<string>}
   */
  public isAuthenticated$: Observable<boolean>;

  public isMobile$: Observable<boolean>;

  constructor(protected menuService: MenuService,
    protected injector: Injector,
              public windowService: HostWindowService,
              public browseService: BrowseService,
              public authorizationService: AuthorizationDataService,
              public route: ActivatedRoute,
              protected themeService: ThemeService,
              private store: Store<AppState>,
              protected hwsService:HWSService
  ) {
    super(menuService, injector, authorizationService, route, themeService,hwsService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.isMobile$ = this.windowService.isUpTo(this.maxMobileWidth);
    this.isAuthenticated$ = this.store.pipe(select(isAuthenticated));
  }
}

import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';

import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { ItemDataService } from '../../core/data/item-data.service';
import { RemoteData } from '../../core/data/remote-data';
import { Item } from '../../core/shared/item.model';
import { fadeInOut } from '../../shared/animations/fade';
import { getAllSucceededRemoteDataPayload, getFirstCompletedRemoteData } from '../../core/shared/operators';
import { ViewMode } from '../../core/shared/view-mode.model';
import { getItemPageRoute } from '../item-page-routing-paths';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { ServerResponseService } from '../../core/services/server-response.service';
import { SignpostingDataService } from '../../core/data/signposting-data.service';
import { SignpostingLink } from '../../core/data/signposting-links.model';
import { isNotEmpty } from '../../shared/empty.util';
import { LinkDefinition, LinkHeadService } from '../../core/services/link-head.service';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { EPerson } from 'src/app/core/eperson/models/eperson.model';
import { AuthService } from 'src/app/core/auth/auth.service';

/**
 * This component renders a simple item page.
 * The route parameter 'id' is used to request the item it represents.
 * All fields of the item that should be displayed, are defined in its template.
 */
@Component({
  selector: 'ds-item-page',
  styleUrls: ['./item-page.component.scss'],
  templateUrl: './item-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut]
})
export class ItemPageComponent implements OnInit, OnDestroy {

  /**
   * The item's id
   */
  id: number;

  /**
   * The item wrapped in a remote-data object
   */
  itemRD$: Observable<RemoteData<Item>>;

  /**
   * The view-mode we're currently on
   */
  viewMode = ViewMode.StandalonePage;

  /**
   * Route to the item's page
   */
  itemPageRoute$: Observable<string>;

  /**
   * Whether the current user is an admin or not
   */
  isAdmin$: Observable<boolean>;

  itemUrl: string;

  /**
   * Contains a list of SignpostingLink related to the item
   */
  signpostingLinks: SignpostingLink[] = [];
  user$:Observable<EPerson>
  
  isItemFav = false;
  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected items: ItemDataService,
    protected authorizationService: AuthorizationDataService,
    protected responseService: ServerResponseService,
    protected signpostingDataService: SignpostingDataService,
    protected linkHeadService: LinkHeadService,
    protected notificationService: NotificationsService,
    @Inject(PLATFORM_ID) protected platformId: string,
    protected authService: AuthService
  ) {
    this.initPageLinks();
  }

  /**
   * Initialize instance variables
   */
  ngOnInit(): void {
    this.itemRD$ = this.route.data.pipe(
      map((data) => data.dso as RemoteData<Item>),
    );
    this.itemPageRoute$ = this.itemRD$.pipe(
      getAllSucceededRemoteDataPayload(),
      map((item) => getItemPageRoute(item))
    );

    this.isAdmin$ = this.authorizationService.isAuthorized(FeatureID.AdministratorOf);

    this.user$ = this.authService.getAuthenticatedUserFromStore();
    let isLoggedInUserId = ''
    this.user$.subscribe(res => {
      isLoggedInUserId = res.id;
    });

    this.itemRD$.subscribe(res => {
     let favpplList =  res.payload.metadata['dc.favourite']?.filter( vendor => vendor['uuid'] ===  isLoggedInUserId);
     if(favpplList != undefined) {
       this.isItemFav = true
     } else {
       this.isItemFav = false
     }
    })
  }

  /**
   * Create page links if any are retrieved by signposting endpoint
   *
   * @private
   */
  private initPageLinks(): void {
    this.route.params.subscribe(params => {
      this.signpostingDataService.getLinks(params.id).pipe(take(1)).subscribe((signpostingLinks: SignpostingLink[]) => {
        let links = '';
        this.signpostingLinks = signpostingLinks;

        signpostingLinks.forEach((link: SignpostingLink) => {
          links = links + (isNotEmpty(links) ? ', ' : '') + `<${link.href}> ; rel="${link.rel}"` + (isNotEmpty(link.type) ? ` ; type="${link.type}" ` : ' ');
          let tag: LinkDefinition = {
            href: link.href,
            rel: link.rel
          };
          if (isNotEmpty(link.type)) {
            tag = Object.assign(tag, {
              type: link.type
            });
          }
          this.linkHeadService.addTag(tag);
        });

        if (isPlatformServer(this.platformId)) {
          this.responseService.setHeader('Link', links);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.signpostingLinks.forEach((link: SignpostingLink) => {
      this.linkHeadService.removeTag(`href='${link.href}'`);
    });
  }

  favClicked() {
    let uuid = '';
    this.itemRD$.subscribe(res => {
      console.log(res.payload.uuid);
      uuid = res.payload.uuid;
    })
    // if(this.isItemFav) {
      this.isItemFav = !this.isItemFav
    // }
    let flag = 0;
    if(this.isItemFav) {
      flag = 1
    } else {
      flag = 0;
    }
  let res = this.items.addOrRemoveItemToFav(uuid,flag).pipe(getFirstCompletedRemoteData());
  res.subscribe(response => {
    console.log(response);
    if(this.isItemFav && response.statusCode == 200) {
      this.notificationService.success('Item Marked as Favourite')
    } else if (!this.isItemFav && response.statusCode == 200) {
      this.notificationService.info('Item removed from Favourites')
    } else {
      this.notificationService.error('Some error occured')
    }
  })
  }
}

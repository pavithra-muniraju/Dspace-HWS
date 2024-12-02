import { ChangeDetectionStrategy, Component } from '@angular/core';
import { fadeInOut } from '../../../../../app/shared/animations/fade';
import { FullItemPageComponent as BaseComponent } from '../../../../../app/item-page/full/full-item-page.component';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { RemoteData } from './../../../../../app/core/data/remote-data';
import { NoContent } from './../../../../../app/core/shared/NoContent.model';

/**
 * This component renders a full item page.
 * The route parameter 'id' is used to request the item it represents.
 */

@Component({
  selector: 'ds-full-item-page',
  styleUrls: ['./full-item-page.component.scss'],
  // styleUrls: ['../../../../../app/item-page/full/full-item-page.component.scss'],
  templateUrl: './full-item-page.component.html',
  //templateUrl: '../../../../../app/item-page/full/full-item-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut]
})
export class FullItemPageComponent extends BaseComponent {
  public isDeleting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  protected messageKey = 'delete';
  isItemFav = false;

  deleteMetadata(id:any) {
    this.isDeleting$.next(true);

  this.subs.push(
    this.items.delete(id).subscribe({
      next: (rd: RemoteData<NoContent>) => {
        if (rd.hasSucceeded) {
          this.notify(true);  // Notify on success
        }
      },
      error: () => {
        this.notify(false);  // Handle any unexpected errors
      },
      // complete: () => {
      //   this.isDeleting$.next(false);  // Reset deletion state
      // }
    })
  );
  }

  notify(succeeded: boolean) {
    if (succeeded) {
      this.notificationsService.success('item.edit.' + this.messageKey + '.success');
      void this.router.navigate(['/mydspace']);
    } 
    else {
      this.notificationsService.error('item.edit.' + this.messageKey + '.error');
      // void this.router.navigate([getItemEditRoute(this.item)]);
    }
  }

  favouriteClick(id:any) {

    this.isItemFav = !this.isItemFav

    let flag = 0;
    if (this.isItemFav) {
      flag = 1
    } else {
      flag = 0;
    }
    this.items.addOrRemoveItemToFav(id, flag).subscribe(res => {

    })

  }
}


import { SearchResultsComponent as BaseComponent } from '../../../../../../app/shared/search/search-results/search-results.component';
import { Component } from '@angular/core';
import { fadeIn, fadeInOut } from '../../../../../../app/shared/animations/fade';
import { SEARCH_CONFIG_SERVICE } from '../../../../../../app/my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../../../../../../app/core/shared/search/search-configuration.service';
import { SortDirection, SortOptions } from '../../../../../../app/core/cache/models/sort-options.model';

@Component({
  selector: 'ds-search-results',
  templateUrl: './search-results.component.html',
 // templateUrl: '../../../../../../app/shared/search/search-results/search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService
    }
  ],
  animations: [
    fadeIn,
    fadeInOut
  ]
})

export class SearchResultsComponent extends BaseComponent {
  
  reloadOrder(event: Event) {
    const values = (event.target as HTMLInputElement).value.split(',');
    this.paginationService.updateRoute(this.searchConfigurationService.paginationID, {
      sortField: values[0],
      sortDirection: values[1] as SortDirection,
      page: 1
    });
  }
}

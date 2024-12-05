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
  draftValues: any;
  documentDataValues: any;

  ngOnChanges() {
    switch (this.configuration) {
      case 'workspace':
      case 'favourite':
        this.documentDataTransform(this.searchResults);
        break;
      
      case 'Drafts':
        this.draftDataTransform(this.searchResults);
        break;
      
      default:
        break;
    }
  }

  documentDataTransform(response: any) {
    const objects = response?.payload?.page || [];
    this. documentDataValues = objects.map((obj: any) => {
      const metadata = obj.indexableObject?.metadata || {};
      const uuid = obj.indexableObject?.uuid

      const provenanceKey = 'dc.description.provenance';
      const titleKey = 'dc.title';
      const descriptionKey = 'dc.lessonlearned.description';

      const hasProvenance = provenanceKey in metadata;
      const hasTitle = titleKey in metadata;
      const hasDescription = descriptionKey in metadata;

      const provenanceValue = hasProvenance ? metadata[provenanceKey]?.[0]?.value : 'N/A';

      const regex = /on (\d{4}-\d{2}-\d{2})/;
      const match = provenanceValue.match(regex);

      if (match) {
        var submittedDate = match[1];
      }
      
      return {
        title: hasTitle ? metadata[titleKey]?.[0]?.value : 'N/A',
        description: hasDescription? metadata[descriptionKey]?.[0]?.value : 'N/A',
        submittedDate: submittedDate,
        uuid: uuid
      }
    });
  }

  draftDataTransform(response: any) {
    const objects = response?.payload?.page || [];
    this.draftValues = objects.map((obj: any) => {
      const sections = obj.indexableObject?.sections;
      const id = obj.indexableObject?.id

      const draftData = sections?.traditionalpageone

      const dateIssued = 'dc.date.issued';
      const titleKey = 'dc.title';
      const descriptionKey = 'dc.description';

      const dateIssue = dateIssued in draftData;
      const hasTitle = titleKey in draftData;
      const hasDescription = descriptionKey in draftData;
      
      return {
        id: id,
        title: hasTitle ? draftData[titleKey]?.[0]?.value : 'N/A',
        description: hasDescription ? draftData[descriptionKey]?.[0]?.value : 'N/A',
        issuedData: dateIssue? draftData[dateIssued]?.[0]?.value : 'N/A',
      }
    });
  }

  reloadOrder(event: Event) {
    const values = (event.target as HTMLInputElement).value.split(',');
    this.paginationService.updateRoute(this.searchConfigurationService.paginationID, {
      sortField: values[0],
      sortDirection: values[1] as SortDirection,
      page: 1
    });
  }

  confirmPopup(content: any, id:any) {
    this.modalService.open(content).result.then(
      (result) => {
        if (result === 'ok') {
        this.items.deleteDraftDoc(id).subscribe(res => {
          window.location.reload();
          })
        }
      }
    );
  }
}

import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ds-rejected-doc',
  templateUrl: './rejected-doc.component.html',
  styleUrls: ['./rejected-doc.component.scss']
})
export class RejectedDocComponent {
  @Input() tableCol: any;
  @Input() rejectResults: any;
  @Input() context: any;
  @Input() configuration: any;
  @Input() searchConfig: any
  testReject: any;
  rejectDocs: any;

  constructor(private router: Router) { }

  jsonResponse: any = {
    // Use the JSON response you provided here
  };

  data: Array<{ publisher: string; author: string; title: string; descriptionProvenance: string[] }> = [];


  ngOnInit() {
  }

  ngOnChanges() {
    this.rejectDocs = this.rejectResults
    this.processData(this.rejectDocs);
  }

  handleButtonClick(id: any): void {
    this.router.navigate([`/workspaceitems/${id}/edit`]); // Navigates to '/target/:id'
  }

  processData(response: any) {
    const objects = response._embedded?.searchResult?._embedded?.objects || [];
    this.data = objects.filter((obj: any) => !obj._embedded?.indexableObject?.errors).map((obj: any) => {
      const indexableObject = obj._embedded?.indexableObject;
      const department = indexableObject?.collectionName;
      const knowledgeArea = indexableObject?.parentCommunityName;
      const metadata = indexableObject?._embedded?.item?.metadata || {};

      const provenanceKey = 'dc.description.provenance';
      const titleKey = 'dc.title';

      const hasProvenance = provenanceKey in metadata;
      const hasTitle = titleKey in metadata;

      const provenanceValue = hasProvenance ? metadata[provenanceKey]?.[1]?.value : 'N/A';

    // Regular expression to capture "Rejected by <user> (email), reason: <reason>"
    const rejectionRegex = /Rejected by ([^,]+), reason: (.+?) on/;
    const rejectionMatch = provenanceValue.match(rejectionRegex);

    // Extract rejectedBy and reason
    const rejectedBy = rejectionMatch ? rejectionMatch[1] : 'N/A';
    const reason = rejectionMatch ? rejectionMatch[2] : 'N/A';

    const regex = /^(\d{4})-(\d{2})-(\d{2})/;
    const match = indexableObject?._embedded?.item?.lastModified.match(regex);

    if (match) {
      var submittedDate = `${match[3]}/${match[2]}/${match[1]}`;
    }

      return {
        id: indexableObject.id,
        title: hasTitle ? metadata[titleKey]?.[0]?.value : 'N/A',
        submissionDate: submittedDate,
        knowledgeArea: knowledgeArea,
        department: department,
        rejectedBy: rejectedBy,
        reason: reason
      };
    });
  }

}

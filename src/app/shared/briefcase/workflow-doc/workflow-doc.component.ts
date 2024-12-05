import { Component, Input } from '@angular/core';

@Component({
  selector: 'ds-workflow-doc',
  templateUrl: './workflow-doc.component.html',
  styleUrls: ['./workflow-doc.component.scss']
})
export class WorkflowDocComponent {

  @Input() tableCol: any;
  @Input() searchResults: any;
  @Input() context: any;
  @Input() configuration: any;
  @Input() searchConfig: any

  jsonResponse: any = {
    // Use the JSON response you provided here
  };

  data: Array<{ publisher: string; author: string; title: string; descriptionProvenance: string[] }> = [];
  rejectDocs: any;


  ngOnInit() {
  }

  ngOnChanges() {
    this.rejectDocs = this.searchResults;
    this.processData(this.rejectDocs);
  }

  processData(response: any) {
    const objects = response?._embedded?.searchResult?._embedded?.objects || [];
    this.data = objects.map((obj: any) => {
      const indexableObject = obj._embedded?.indexableObject;
      const department = indexableObject?.collectionName;
      const knowledgeArea = indexableObject?.parentCommunityName;
      const pendingWith = indexableObject?.pendingWithEmail

      const metadata = indexableObject?._embedded?.item?.metadata || {};

      const provenanceKey = 'dc.description.provenance';
      const titleKey = 'dc.title';

      const hasProvenance = provenanceKey in metadata;
      const hasTitle = titleKey in metadata;

      const provenanceValue = hasProvenance ? metadata[provenanceKey]?.[0]?.value : 'N/A';

      var lastStepIndex = provenanceValue.lastIndexOf('Step:');

      if (lastStepIndex !== -1) {
        var relevantPart = provenanceValue.slice(lastStepIndex);
        const regex = /Step:\s*([a-zA-Z]+)Step/;
        const match = relevantPart.match(regex);

        if (match) {
          var approvalStatus = match[1]
        }
      }

      const regex = /Submitted by (.+?) on (\d{4}-\d{2}-\d{2})/;
      const match = provenanceValue.match(regex);

      if (match) {
        var submittedBy = match[1];
        var date = match[2];
      }

      return {
        title: hasTitle ? metadata[titleKey]?.[0]?.value : 'N/A',
        submissionDate: date,
        knowledgeArea: knowledgeArea,
        department: department,
        author: submittedBy,
        approvalStatus: approvalStatus,
        pendingWith: pendingWith
      }
    });
  }


}

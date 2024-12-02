import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'ds-my-tasks',
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.scss']
})
export class MyTasksComponent {
  @Input() tableCol: any;
  @Input() searchResults: any;
  @Input() context: any;
  @Input() configuration: any;
  @Input() searchConfig: any
  testReject: any;
  workflowDocs: any;
  data: any;
  // data: Array<{ publisher: string; author: string; title: string; descriptionProvenance: string[] }> = [];


  ngOnChanges() {
    this.workflowDocs = this.searchResults
    console.log(this.workflowDocs);
    if (this.workflowDocs != null) {
      this.processData(this.workflowDocs);
    }

  }

  processData(response: any) {
    this.data = [];
    const objects = response?._embedded?.searchResult?._embedded?.objects || [];
    objects.forEach(element => {
      let obj = element._embedded?.indexableObject?._embedded;
      const knowledgeArea = obj?.workflowitem?.parentCommunityName;
      const date = obj?.workflowitem?.lastModified
      const submittedBy = ''
      let sectionkeys = Object.keys(obj?.workflowitem?.sections);
      let workflowName = '';
      sectionkeys.forEach(ele => {
        if (ele.indexOf('workflow') !== -1) {
          workflowName = ele
        }
      })
      const title = obj?.workflowitem?.sections[workflowName]['dc.title'][0].value

      let pushFormat = {
        title: title,
        submissionDate: date,
        knowledgeArea: knowledgeArea,
        author: submittedBy,
        fileList: obj?.workflowitem?.sections?.upload.files || [],
        indexableObject: element._embedded?.indexableObject
      }
      this.data.push(pushFormat)
    });
    // this.data = objects.filter((obj: any) => !obj._embedded?.indexableObject?._embedded).map((obj: any) => {
    //   const knowledgeArea = obj?.workflowitem?.parentCommunityName;
    //   const date = obj?.workflowitem?.lastModified
    //   const submittedBy = ''
    //   const title = ''

    //   return {

    //   }
    // });
  }

  getFilesName(data) {
    console.log(data)
  }
}

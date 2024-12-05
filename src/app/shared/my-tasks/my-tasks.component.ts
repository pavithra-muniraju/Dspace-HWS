import { Component, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, mergeMap, Observable, tap } from 'rxjs';
import { LinkService } from 'src/app/core/cache/builders/link.service';
import { RemoteData } from 'src/app/core/data/remote-data';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { Item } from 'src/app/core/shared/item.model';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';
import { WorkflowItem } from 'src/app/core/submission/models/workflowitem.model';
import { isNotEmpty } from '../empty.util';
import { followLink } from '../utils/follow-link-config.model';
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
  reloadedObject = new EventEmitter<DSpaceObject>();
  // data: Array<{ publisher: string; author: string; title: string; descriptionProvenance: string[] }> = [];

  constructor(
    private linkService: LinkService
  ) { }
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
        indexableObject: element._embedded?.indexableObject,
        expanded: false
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
  getFormat(name) {
    let format = name.split('.');
    return format[format.length - 1];
  }

  getWorkFlowObj(item) {
    item.workflowitem$ = new BehaviorSubject<WorkflowItem>(null);
    this.linkService.resolveLinks(item.indexableObject, followLink('workflowitem', {},
      followLink('item', {}, followLink('bundles')),
      followLink('submitter')
    ), followLink('action'));

    (item.indexableObject.workflowitem as Observable<RemoteData<WorkflowItem>>).pipe(
      getFirstCompletedRemoteData(),
      mergeMap((wfiRD: RemoteData<WorkflowItem>) => {
        if (wfiRD.hasSucceeded) {
          item.workflowitem$.next(wfiRD.payload);
          return (wfiRD.payload.item as Observable<RemoteData<Item>>).pipe(
            getFirstCompletedRemoteData()
          );
        } else {
          return EMPTY;
        }
      }),
      tap((itemRD: RemoteData<Item>) => {
        if (isNotEmpty(itemRD) && itemRD.hasSucceeded) {
          item.item$.next(itemRD.payload);
        }
      })
    ).subscribe();

  }
  reloadObject(dso: DSpaceObject) {
    this.reloadedObject.emit(dso);
  }
}

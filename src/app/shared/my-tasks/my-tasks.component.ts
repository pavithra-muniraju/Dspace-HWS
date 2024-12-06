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


    if (this.searchResults != null) {
      this.workflowDocs = this.searchResults?.payload?.page;
      // this.processData(this.workflowDocs);
    }
    console.log(this.workflowDocs);
    if (this.workflowDocs.length > 0) {
      this.workflowDocs.forEach(element => {
        this.getWorkFlowObj(element)
      });
    }


  }

  // not used
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

      this.data.push(pushFormat);

    });
    // this.data.forEach(element => {
    //   this.getWorkFlowObj(element)
    // });

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
    // console.log(item)
    item.workflowitem$ = new BehaviorSubject<WorkflowItem>(null);
    item.item$ = new BehaviorSubject<WorkflowItem>(null);
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
        this.getTableData(item)
      })
    ).subscribe();
    console.log(item);

  }
  reloadObject(dso: DSpaceObject) {
    this.reloadedObject.emit(dso);
  }

  getTableData(element) {
    element.tableData = {
      knowledgeArea: 'Lesson Learned',
      title: '',
      author: '',
      submittedDate: '',
      actionType: '',
      fileList: [],
      expanded: false
    }
    element.tableData.actionType = element.indexableObject.type;
    let workflowitemvalue = element.workflowitem$._value;
    element.tableData.fileList = workflowitemvalue.sections.upload.files || [];
    let sectionkeys = Object.keys(workflowitemvalue.sections);
    let workflowName = '';
    sectionkeys.forEach(ele => {
      if (ele.indexOf('workflow') !== -1) {
        workflowName = ele
      }
    });
    element.tableData.title = workflowitemvalue.sections[workflowName]['dc.title'][0].value

    const provenanceKey = 'dc.description.provenance';
    const metadata = element.item$._value.metadata || {};
    const hasProvenance = provenanceKey in metadata;
    const provenanceValue = hasProvenance ? metadata[provenanceKey]?.[0]?.value : 'N/A';
    const regex = /on (\d{4}-\d{2}-\d{2})/;
    const match = provenanceValue.match(regex);
    if (match) {
      element.tableData.submittedDate = match[1];
    }
    element.tableData.author = provenanceValue.split('(')[0].split('Submitted by')[1];
    console.log(element)
  }

  // _reloadObject(): Observable<DSpaceObject> {
  //   return this.reloadObjectExecution().pipe(
  //     switchMap((res) => {
  //       if (res instanceof RemoteData) {
  //         return of(res).pipe(getFirstCompletedRemoteData(), map((completed) => completed.payload));
  //       } else {
  //         return of(res);
  //       }
  //     })).pipe(map((dso) => {
  //         return dso ? this.convertReloadedObject(dso) : dso;
  //   }));
  // }
}

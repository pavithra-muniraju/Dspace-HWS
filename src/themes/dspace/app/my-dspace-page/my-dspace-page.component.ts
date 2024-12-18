
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { pushInOut } from '../../../../app/shared/animations/push';
import { MyDSpacePageComponent as BaseComponent, SEARCH_CONFIG_SERVICE } from '../../../../app/my-dspace-page/my-dspace-page.component';
import { MyDSpaceConfigurationService } from '../../../../app/my-dspace-page/my-dspace-configuration.service';
import { SearchService } from 'src/app/core/shared/search/search.service';
import { ActivatedRoute } from '@angular/router';
/**
 * This component represents the whole mydspace page
 */
@Component({
  selector: 'ds-my-dspace-page',
  styleUrls: ['./my-dspace-page.component.scss'],
  //styleUrls: ['../../../../app/my-dspace-page/my-dspace-page.component.scss'],
  templateUrl: './my-dspace-page.component.html',
 // templateUrl: '../../../../app/my-dspace-page/my-dspace-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [pushInOut],
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: MyDSpaceConfigurationService
    }
  ]
})
export class MyDSpacePageComponent extends BaseComponent {
  // sidebarItems: string[] = ['Favourites', 'Recents', 'My Documents','Rejected Documents'];
  currentContent: string = '';
  configuration:string = '';
  sidebarItems:any = [];
  constructor(protected service: SearchService,
    protected searchConfigService: MyDSpaceConfigurationService,
    protected route: ActivatedRoute
   ) {
    super(service,searchConfigService);
  }
  changeContent(contentTitle: string, contentValue:string) {
    this.currentContent = contentTitle;
    this.configuration = contentValue;
  }
  ngOnInit() {
    this.route.queryParams.subscribe(res => {
      this.configuration = res.configuration;
      if(this.configuration == 'workspace') {
        this.sidebarItems = [{key:'Favourites',value:'favourite'}, {key:'Recents',value:'recents'},{key:'My Documents',value:'workspace'},{key:'Drafts',value:'Drafts'},{key:'Rejected Documents',value:'rejected'}, {key:'Workflow Documents', value:'pending'}]
        this.currentContent = 'My Documents'
        this.changeContent(this.currentContent, this.configuration)
      } else if(this.configuration == 'workflow') {
        this.sidebarItems =  [{key:'My Tasks',value:'workflow'}, {key:'Task History',value:'pending'}]
        this.currentContent = 'My Tasks'
        this.changeContent(this.currentContent, this.configuration)
      }
      // if(res.configuration == 'workspace')
    })
    
  }
}

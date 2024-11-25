import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HomeNewsComponent } from './home-news/home-news.component';
import { HomePageRoutingModule } from './home-page-routing.module';

import { HomePageComponent } from './home-page.component';
import { TopLevelCommunityListComponent } from './top-level-community-list/top-level-community-list.component';
import { StatisticsModule } from '../statistics/statistics.module';
import { ThemedHomeNewsComponent } from './home-news/themed-home-news.component';
import { ThemedHomePageComponent } from './themed-home-page.component';
import { RecentItemListComponent } from './recent-item-list/recent-item-list.component';
import { JournalEntitiesModule } from '../entity-groups/journal-entities/journal-entities.module';
import { ResearchEntitiesModule } from '../entity-groups/research-entities/research-entities.module';
import { ThemedTopLevelCommunityListComponent } from './top-level-community-list/themed-top-level-community-list.component';
import { NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';
import {MatStepperModule  } from '@angular/material/stepper';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatToolbarModule} from '@angular/material/toolbar';
import { WorkspaceitemsEditPageModule } from '../workspaceitems-edit-page/workspaceitems-edit-page.module';
import { SubmissionModule } from '../submission/submission.module';
import { MatTableModule } from '@angular/material/table';

const DECLARATIONS = [
  HomePageComponent,
  ThemedHomePageComponent,
  TopLevelCommunityListComponent,
  ThemedTopLevelCommunityListComponent,
  ThemedHomeNewsComponent,
  HomeNewsComponent,
  RecentItemListComponent
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule.withEntryComponents(),
    JournalEntitiesModule.withEntryComponents(),
    ResearchEntitiesModule.withEntryComponents(),
    HomePageRoutingModule,
    StatisticsModule.forRoot(),
    NgbDropdownModule,
    MatStepperModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatToolbarModule,
    WorkspaceitemsEditPageModule,
    SubmissionModule,
    MatTableModule
  ],
  declarations: [
    ...DECLARATIONS,
  ],
  exports: [
    ...DECLARATIONS,
    MatStepperModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatToolbarModule
  ],
})
export class HomePageModule {

}

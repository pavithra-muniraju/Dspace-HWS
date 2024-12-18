import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {
  AdminSidebarSectionComponent
} from './admin/admin-sidebar/admin-sidebar-section/admin-sidebar-section.component';
import { AdminSidebarComponent } from './admin/admin-sidebar/admin-sidebar.component';
import { ThemedAdminSidebarComponent } from './admin/admin-sidebar/themed-admin-sidebar.component';
import {
  ExpandableAdminSidebarSectionComponent
} from './admin/admin-sidebar/expandable-admin-sidebar-section/expandable-admin-sidebar-section.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderNavbarWrapperComponent } from './header-nav-wrapper/header-navbar-wrapper.component';
import { HeaderComponent } from './header/header.component';
import { NavbarModule } from './navbar/navbar.module';
import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';
import { NotificationComponent } from './shared/notifications/notification/notification.component';
import {
  NotificationsBoardComponent
} from './shared/notifications/notifications-board/notifications-board.component';
import { SharedModule } from './shared/shared.module';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { RootComponent } from './root/root.component';
import { ThemedRootComponent } from './root/themed-root.component';
import { ThemedPageNotFoundComponent } from './pagenotfound/themed-pagenotfound.component';
import { ThemedForbiddenComponent } from './forbidden/themed-forbidden.component';
import { ThemedHeaderComponent } from './header/themed-header.component';
import { ThemedFooterComponent } from './footer/themed-footer.component';
import { ThemedBreadcrumbsComponent } from './breadcrumbs/themed-breadcrumbs.component';
import {
  ThemedHeaderNavbarWrapperComponent
} from './header-nav-wrapper/themed-header-navbar-wrapper.component';
import { IdleModalComponent } from './shared/idle-modal/idle-modal.component';
import {
  ThemedPageInternalServerErrorComponent
} from './page-internal-server-error/themed-page-internal-server-error.component';
import {
  PageInternalServerErrorComponent
} from './page-internal-server-error/page-internal-server-error.component';
import { ThemedPageErrorComponent } from './page-error/themed-page-error.component';
import { PageErrorComponent } from './page-error/page-error.component';
import { ContextHelpToggleComponent } from './header/context-help-toggle/context-help-toggle.component';
import { SystemWideAlertModule } from './system-wide-alert/system-wide-alert.module';
import { HwsHeaderComponent } from './header/hws-header/hws-header.component';
import { GoogleLoginComponent } from './google-login/google-login.component';
import {
  SocialLoginModule,
  SocialAuthServiceConfig
} from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import { HwsAboutComponent } from './hws-about/hws-about.component';
import { UserManualComponent } from '../app/info/user-manual/user-manual.component';
import { TodolistComponent } from './todolist/todolist.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { UserInfoComponent } from './user-info/user-info.component';
// import { SingleUploadComponent } from './home-page/single-upload/single-upload.component'
import { NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';
import {MatStepperModule  } from '@angular/material/stepper';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatToolbarModule} from '@angular/material/toolbar';
import { FileUploadComponent } from './home-page/single-upload/file-upload/file-upload.component';
import { DragDropDirective } from './home-page/single-upload/drag-drop.directive';
import { FileListComponent } from './home-page/single-upload/file-list/file-list.component';
import { MatTableModule } from '@angular/material/table';
import { UploadItemComponent } from './home-page/upload-item/upload-item.component';
const IMPORTS = [
  CommonModule,
  SharedModule.withEntryComponents(),
  NavbarModule,
  SystemWideAlertModule,
  NgbModule,
  SocialLoginModule,
  MatStepperModule,
  MatIconModule,
  MatButtonModule,
  MatInputModule,
  MatFormFieldModule,
  MatRadioModule,
  MatSelectModule,
  MatToolbarModule,
  MatTableModule,
  
];

const PROVIDERS = [
  {
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(
            '375028053029-7eotj9n2celo86njcuq76thscd3oe22u.apps.googleusercontent.com'
          )
        }
      ]
    } as SocialAuthServiceConfig
  }
];

const DECLARATIONS = [
  RootComponent,
  ThemedRootComponent,
  HeaderComponent,
  ThemedHeaderComponent,
  HeaderNavbarWrapperComponent,
  ThemedHeaderNavbarWrapperComponent,
  AdminSidebarComponent,
  ThemedAdminSidebarComponent,
  AdminSidebarSectionComponent,
  ExpandableAdminSidebarSectionComponent,
  FooterComponent,
  ThemedFooterComponent,
  PageNotFoundComponent,
  ThemedPageNotFoundComponent,
  NotificationComponent,
  NotificationsBoardComponent,
  BreadcrumbsComponent,
  ThemedBreadcrumbsComponent,
  ForbiddenComponent,
  ThemedForbiddenComponent,
  IdleModalComponent,
  ThemedPageInternalServerErrorComponent,
  PageInternalServerErrorComponent,
  ThemedPageErrorComponent,
  PageErrorComponent,
  ContextHelpToggleComponent,
  HwsHeaderComponent,
  TodolistComponent,
  UnauthorizedComponent,

];

const EXPORTS = [
];

@NgModule({
  imports: [
    ...IMPORTS
  ],
  providers: [
    ...PROVIDERS
  ],
  declarations: [
    ...DECLARATIONS,
    HwsHeaderComponent,
    GoogleLoginComponent,
    HwsAboutComponent,
    UserManualComponent,
    TodolistComponent,
    UnauthorizedComponent,
    UserInfoComponent,
    // UploadItemComponent,
    // SingleUploadComponent,
    // FileListComponent
  ],
  exports: [
    ...EXPORTS,
    ...DECLARATIONS,
  ]
})
export class RootModule {

}

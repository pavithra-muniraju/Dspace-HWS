import { map } from 'rxjs/operators';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthenticateAction, ResetAuthenticationMessagesAction } from '../../../../core/auth/auth.actions';

import { getAuthenticationError, getAuthenticationInfo, } from '../../../../core/auth/selectors';
import { isNotEmpty } from '../../../empty.util';
import { fadeOut } from '../../../animations/fade';
import { AuthMethodType } from '../../../../core/auth/models/auth.method-type';
import { renderAuthMethodFor } from '../log-in.methods-decorator';
import { AuthMethod } from '../../../../core/auth/models/auth.method';
import { AuthService } from '../../../../core/auth/auth.service';
import { HardRedirectService } from '../../../../core/services/hard-redirect.service';
import { CoreState } from '../../../../core/core-state.model';
import { getForgotPasswordRoute, getRegisterRoute } from '../../../../app-routing-paths';
import { FeatureID } from '../../../../core/data/feature-authorization/feature-id';
import { AuthorizationDataService } from '../../../../core/data/feature-authorization/authorization-data.service';
import { HWSService } from 'src/app/HWS-Shared/hws.service';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';

/**
 * /users/sign-in
 * @class LogInPasswordComponent
 */
@Component({
  selector: 'ds-log-in-password',
  templateUrl: './log-in-password.component.html',
  styleUrls: ['./log-in-password.component.scss'],
  animations: [fadeOut]
})
@renderAuthMethodFor(AuthMethodType.Password)
export class LogInPasswordComponent {

  /**
   * The authentication method data.
   * @type {AuthMethod}
   */
  public authMethod: AuthMethod;

  /**
   * The error if authentication fails.
   * @type {Observable<string>}
   */
  public error: Observable<string>;

  /**
   * Has authentication error.
   * @type {boolean}
   */
  public hasError = false;

  /**
   * The authentication info message.
   * @type {Observable<string>}
   */
  public message: Observable<string>;

  /**
   * Has authentication message.
   * @type {boolean}
   */
  public hasMessage = false;

  /**
   * The authentication form.
   * @type {FormGroup}
   */
  public form: UntypedFormGroup;

  /**
   * Whether the current user (or anonymous) is authorized to register an account
   */
  public canRegister$: Observable<boolean>;
  isChecked  = false;

  constructor(
    @Inject('authMethodProvider') public injectedAuthMethodModel: AuthMethod,
    @Inject('isStandalonePage') public isStandalonePage: boolean,
    private authService: AuthService,
    private hardRedirectService: HardRedirectService,
    private formBuilder: UntypedFormBuilder,
    protected store: Store<CoreState>,
    protected authorizationService: AuthorizationDataService,
    private hwsService: HWSService,
    private router: Router,
    private notificationService: NotificationsService
  ) {
    this.authMethod = injectedAuthMethodModel;
  }

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   * @method ngOnInit
   */
  public ngOnInit() {

    // set formGroup
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });

    // set error
    this.error = this.store.pipe(select(
      getAuthenticationError),
      map((error) => {
        this.hasError = (isNotEmpty(error));
        this.hwsService.hasError(this.hasError);
        console.log(error);
        // if(this.hasError) {
        //   this.notificationService.error('Invalid Email ID or Password')
        // }
        return error;
      })
    );
    

    // set error
    this.message = this.store.pipe(
      select(getAuthenticationInfo),
      map((message) => {
        this.hasMessage = (isNotEmpty(message));
        return message;
      })
    );

    this.canRegister$ = this.authorizationService.isAuthorized(FeatureID.EPersonRegistration);
    let checked:string = localStorage.getItem('hws-checked');
    if(checked == 'true') {
      let username = localStorage.getItem('hws-username');
      let password = localStorage.getItem('hws-pass');
      this.isChecked = true
      this.form.setValue({
        email: username,
        password: password
      })
    } else {
      this.isChecked = false
    }

   
    
  }

  getRegisterRoute() {
    return getRegisterRoute();
  }

  getForgotRoute() {
    return getForgotPasswordRoute();
  }

  /**
   * Reset error or message.
   */
  public resetErrorOrMessage() {
    if (this.hasError || this.hasMessage) {
      this.store.dispatch(new ResetAuthenticationMessagesAction());
      this.hasError = false;
      this.hasMessage = false;
    }
  }

  /**
   * Submit the authentication form.
   * @method submit
   */
  public submit() {
    this.resetErrorOrMessage();
    // get email and password values
    const email: string = this.form.get('email').value;
    const password: string = this.form.get('password').value;

    // trim values
    email.trim();
    password.trim();
    console.log(this.isStandalonePage)
    if (!this.isStandalonePage) {
      this.authService.setRedirectUrl(this.hardRedirectService.getCurrentRoute());
    } else {
      this.authService.setRedirectUrlIfNotSet('/');
    }

    // dispatch AuthenticationAction
    this.store.dispatch(new AuthenticateAction(email, password));

    // clear form
    this.form.reset();
  }
// not used
  navigateToGoogleLogin() {
    this.hwsService.passRouteData('/googlelogin');
    this.router.navigateByUrl('/googlelogin')
  }

  rememberMe(event) {
    console.log(event.target.checked);
    if(event.target.checked) {
      localStorage.setItem('hws-checked','true');
      localStorage.setItem('hws-pass', this.form.get('password').value);
      localStorage.setItem('hws-username', this.form.get('email').value);
    } else {
      localStorage.setItem('hws-checked','false');
      localStorage.removeItem('hws-pass')
      localStorage.removeItem('hws-username')
    }

   
    
  }
}

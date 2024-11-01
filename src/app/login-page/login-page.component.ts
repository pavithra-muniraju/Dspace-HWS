import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { combineLatest as observableCombineLatest, Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';

import { AppState } from '../app.reducer';
import {
  AddAuthenticationMessageAction,
  AuthenticatedAction,
  AuthenticationSuccessAction,
  ResetAuthenticationMessagesAction
} from '../core/auth/auth.actions';
import { hasValue, isNotEmpty } from '../shared/empty.util';
import { AuthTokenInfo } from '../core/auth/models/auth-token-info.model';
import { getAuthenticationMethods, isAuthenticated } from '../core/auth/selectors';
import { AuthMethod } from '../core/auth/models/auth.method';
import { rendersAuthMethodType } from '../shared/log-in/methods/log-in.methods-decorator';

/**
 * This component represents the login page
 */
@Component({
  selector: 'ds-login-page',
  styleUrls: ['./login-page.component.scss'],
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent implements OnDestroy, OnInit {

  /**
   * Subscription to unsubscribe onDestroy
   * @type {Subscription}
   */
  sub: Subscription;

  /**
   * Initialize instance variables
   *
   * @param {ActivatedRoute} route
   * @param {Store<AppState>} store
   */
   authMethods:any;
   loginType = '';
  constructor(private route: ActivatedRoute,
              private store: Store<AppState>) {}

  /**
   * Initialize instance variables
   */
  ngOnInit() {
    const queryParamsObs = this.route.queryParams;
    const authenticated = this.store.select(isAuthenticated);
    this.sub = observableCombineLatest(queryParamsObs, authenticated).pipe(
      filter(([params, auth]) => isNotEmpty(params.token) || isNotEmpty(params.expired)),
      take(1)
    ).subscribe(([params, auth]) => {
      const token = params.token;
      let authToken: AuthTokenInfo;
      if (!auth) {
        if (isNotEmpty(token)) {
          authToken = new AuthTokenInfo(token);
          this.store.dispatch(new AuthenticatedAction(authToken));
        } else if (isNotEmpty(params.expired)) {
          this.store.dispatch(new AddAuthenticationMessageAction('auth.messages.expired'));
        }
      } else {
        if (isNotEmpty(token)) {
          authToken = new AuthTokenInfo(token);
          this.store.dispatch(new AuthenticationSuccessAction(authToken));
        }
      }
    });

    this.authMethods = this.store.pipe(
      select(getAuthenticationMethods),
      map((methods: AuthMethod[]) => methods
        .filter((authMethod: AuthMethod) => rendersAuthMethodType(authMethod.authMethodType) !== undefined)
        .sort((method1: AuthMethod, method2: AuthMethod) => method1.position - method2.position)
      ),
    );
    this.authMethods.subscribe(res => {
      console.log(res);
    });
    this.loginType = this.authMethods[0].authMethodType;
  }

  /**
   * Unsubscribe from subscription
   */
  ngOnDestroy() {
    if (hasValue(this.sub)) {
      this.sub.unsubscribe();
    }
    // Clear all authentication messages when leaving login page
    this.store.dispatch(new ResetAuthenticationMessagesAction());
  }
}

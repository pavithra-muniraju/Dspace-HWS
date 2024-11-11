import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import { LogOutAction } from '../core/auth/auth.actions';

@Component({
  selector: 'ds-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent {

  constructor(private router: Router,
    private store: Store<AppState>) {
}

  backToLogin() {
    this.store.dispatch(new LogOutAction());
    this.router.navigate(['/login']);
  }
}

import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Site } from '../core/shared/site.model';
import { environment } from '../../environments/environment';
import { AppState } from '../app.reducer';
import { isAuthenticated, isAuthenticationLoading } from '../core/auth/selectors';
import { select, Store } from '@ngrx/store';
@Component({
  selector: 'ds-home-page',
  styleUrls: ['./home-page.component.scss'],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent implements OnInit {
  site$: Observable<Site>;
  recentSubmissionspageSize: number;

  public isAuthenticated: Observable<boolean>;
  public showAuth = false;
  isLoginAuthenticated  = false;

  
  searchPlaceholder: string = 'Type Keyword, Section, Unit or Project Code to Search';

  query:string = '';

  brandColor = 'primary';
  
  constructor(
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private router: Router
  ) {
    this.recentSubmissionspageSize = environment.homePage.recentSubmissions.pageSize;
  }

  ngOnInit(): void {
    this.site$ = this.route.data.pipe(
      map((data) => data.site as Site),
    );
    this.isAuthenticated = this.store.pipe(select(isAuthenticated));

    this.isAuthenticated.subscribe(res => {
      this.isLoginAuthenticated = res;
      if(this.isLoginAuthenticated == false) {
        
        this.router.navigateByUrl('/login');
      }
    })
  }

  


  onSubmit(data) {
    
  }

  uploadtype(type) {
    
  }
}

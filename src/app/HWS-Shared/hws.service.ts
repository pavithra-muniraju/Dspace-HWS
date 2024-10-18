import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from 'express';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
export class HWSService {
    private currentroute = new BehaviorSubject<any>("");

    public shareRouteInfo = this.currentroute.asObservable();

    passRouteData(data){
        this.currentroute.next(data);
    }
}
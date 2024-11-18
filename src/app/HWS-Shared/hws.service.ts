import { EventEmitter, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from 'express';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
export class HWSService {
    private currentroute = new BehaviorSubject<any>("");
    private hasErrorData = new BehaviorSubject<any>("");


    public shareRouteInfo = this.currentroute.asObservable();
    public hasErrorInfo = this.hasErrorData.asObservable();


    private customMenuData$: EventEmitter<any>;

    constructor() { 
        this.customMenuData$ = new EventEmitter<any>();
      }

    passRouteData(data){
        this.currentroute.next(data);
    }

    setCustomMenuData(data){
        this.customMenuData$.emit(data);
    }
     
    getCustomMenuData(){
        return this.customMenuData$;
    }

    hasError(data){
        this.hasErrorData.next(data);
    }
}
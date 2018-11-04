import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class SharedTodaysEpService {

    pricesListList = new Object();
    
    constructor(private http: Http) {}

}
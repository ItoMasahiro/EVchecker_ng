import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class SharedEpService {

    pricesListList = new Object();

    constructor(private http: Http) { }

}
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'todays-ep-main',
  templateUrl: './todays-ep-main.component.html',
  styleUrls: ['./todays-ep-main.component.css']
})
export class TodaysEpMainComponent implements OnInit {

  typeTodaysEpShow = 0;

  constructor() { }

  ngOnInit() {
  }

  changeEpType(type) {
    const elems = document.getElementById('epTypeHeader').children;
    for (let i = 0; i < elems.length; i++) {
      if (i == type) {
        elems[i].setAttribute('class', 'item active'); 
      } else {
        elems[i].setAttribute('class', 'item');
      }
    }
    this.typeTodaysEpShow = type;
  }
}

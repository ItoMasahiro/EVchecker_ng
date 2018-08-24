import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ep-main',
  templateUrl: './ep-main.component.html',
  styleUrls: ['./ep-main.component.css']
})
export class EpMainComponent implements OnInit {

  typeEpShow = 0;

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
    this.typeEpShow = type;
  }
}

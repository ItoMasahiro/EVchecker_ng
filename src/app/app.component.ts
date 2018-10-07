import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'findEV yeah';

  constructor(private router: Router) {
    // このサイトに飛んできた時、ページを更新した時にep-mainページへ遷移させる
    this.router.navigate(["/ep-main"]);
  }

  changePage(page) {
    const elems = document.getElementById('pageHeader').children;
    for (let i = 0; i < elems.length; i++) {
      if (i == page) {
        elems[i].setAttribute('class', 'item active');
      } else {
        elems[i].setAttribute('class', 'item');
      }
    }
  }
}

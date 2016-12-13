import { Component } from '@angular/core';
import {NavigationEnd, Event, Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'app works!';
  hideBars = false;

  constructor(router: Router) {
    router.events.filter(e => e instanceof NavigationEnd).subscribe((result: Event) => {
      this.hideBars = result.url.indexOf("login") !== -1 || result.url.indexOf("register") !== -1;
    });
  }
}

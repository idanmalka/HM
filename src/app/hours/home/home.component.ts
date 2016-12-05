import { Component } from '@angular/core';

@Component({
  selector: 'home-page',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.less']
})
export class HomeComponent{
  pageTitle :string = "HomePage";
}

import { Component } from '@angular/core';
import {AuthenticationService} from "../../shared/services/authentication.service";
import { Router } from "@angular/router";

@Component({
  selector: 'home-page',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.less']
})
export class HomeComponent{
  pageTitle :string = "HomePage";

  constructor(private authenticationService : AuthenticationService, private router: Router){

  }

  logout(){
  this.authenticationService.logout();
  this.router.navigate(['/login']);
  }
}

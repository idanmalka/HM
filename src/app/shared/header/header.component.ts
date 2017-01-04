import  { Component } from "@angular/core";
import {Router} from "@angular/router";
import {AuthenticationService} from "../services/authentication.service";
import {User} from "../../models/user";
import {UserService} from "../services/user.service";

@Component({
  selector: 'app-header',
  templateUrl: "header.component.html",
  styleUrls: ["header.component.less"]
})

export class HeaderComponent{
  private user : User;

  constructor(private userService: UserService,
              private authenticationService : AuthenticationService,
              private router: Router){
    this.authenticationService.validate();
    this.user = this.authenticationService.user;
  }

  logout() : void{
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  goto(location:string):void {
    console.log('going to: '+location);
    this.router.navigate(['/'+location]);
  }
}

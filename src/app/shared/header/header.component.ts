import  { Component, OnInit } from "@angular/core";
import {Router} from "@angular/router";
import {AuthenticationService} from "../services/authentication.service";
import {User} from "../../models/user";
import {UserService} from "../services/user.service";

@Component({
  selector: 'app-header',
  templateUrl: "header.component.html",
  styleUrls: ["header.component.less"]
})

export class HeaderComponent implements OnInit{
  private user : User;

  constructor(private authenticationService : AuthenticationService,
              private router: Router){
    this.authenticationService.validate();
  }

  ngOnInit(): void{
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

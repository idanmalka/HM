import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "../../shared/services/authentication.service";
import { Router } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../shared/services/user.service";

@Component({
  selector: 'home-page',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.less']
})
export class HomeComponent implements OnInit{
  pageTitle :string = "HomePage";
  user: User;

  constructor(private authenticationService : AuthenticationService,
              private router: Router,
              private userService: UserService){ }

  ngOnInit(){
    this.user = this.userService.getCurrentUser();
    console.log(this.user);
  }

  logout(){
  this.authenticationService.logout();
  this.router.navigate(['/login']);
  }
}

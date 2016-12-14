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
  user: User;
  displayCalendar: boolean = false;

  constructor(private authenticationService : AuthenticationService,
              private router: Router,
              private userService: UserService){ }

  ngOnInit(){
    this.user = this.userService.getCurrentUser().user;
    console.log(this.user);
  }

  toggleCalendar() : void {
    this.displayCalendar = !this.displayCalendar;
  }

  addShift() :void {
    console.log("clicked add shift");
  }

  editShift() :void{
    console.log("clicked edit shift");
  }
}

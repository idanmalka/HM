import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthenticationService } from "../shared/services/authentication.service";
import { AlertService } from "../shared/services/alert.service";

@Component({
  selector: 'login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.less']
})
export class LoginComponent implements OnInit{
  model: any = {};
  loading = false;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private alertService: AlertService) {
  }

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();
  }

  login() {
    this.loading = true;
    this.authenticationService.login(this.model.username, this.model.password)
      .subscribe(
        data => {
          this.alertService.success('התחבר בהצלחה');
          this.router.navigate(['/']);
        },
        error => {
          this.alertService.error(error._body);
          this.loading = false;
        });
  }
}


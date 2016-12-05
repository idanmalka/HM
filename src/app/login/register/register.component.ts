import { Component } from '@angular/core';
import { DatePipe } from '@angular/common/src/pipes';
import { Router } from '@angular/router';

import { AlertService } from '../../shared/services/alert.service';
import { UserService } from '../../shared/services/user.service';
import {User} from "../../models/user";

@Component({
  templateUrl: './register.component.html',
  styleUrls: [ './register.component.less'],
  providers: [ DatePipe ]
})

export class RegisterComponent {
  model: User = new User();
  loading = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private alertService: AlertService) { }

  register() {
    this.loading = true;
    model.isAdmin = false;
    model.isManager = true;
    this.userService.create(this.model)
      .subscribe(
        data => {
          this.alertService.success('Registration successful', true);
          this.router.navigate(['/login']);
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }
}

import { Component } from '@angular/core';
import { DatePipe } from '@angular/common/src/pipes';
import { Router } from '@angular/router';

import { AlertService } from '../../shared/services/alert.service';
import { UserService } from '../../shared/services/user.service';
import { CompanyService } from '../../shared/services/company.service';
import {User} from "../../models/user";
import {Company} from "../../models/company";

@Component({
  templateUrl: './register.component.html',
  styleUrls: [ './register.component.less'],
  providers: [ DatePipe ]
})

export class RegisterComponent {
  model: User = new User();
  company : Company = new Company();
  loading = false;

  constructor(
    private router: Router,
    private companyService: CompanyService,
    private userService: UserService,
    private alertService: AlertService) { }

  register() {
    this.loading = true;
    this.model.department = "הנהלה";
    this.model.role = "מנהל כללי";
    this.model.isAdmin = false;
    this.model.isManager = true;
    this.model.shifts = [];
    this.model.companyId = 0;
    this.company.employees = [];
    console.log(this.company);

    this.companyService.create({company: this.company, user: this.model })
      .subscribe(
        data => {
          this.alertService.success('Registration Company successful', true);
          this.router.navigate(['/login']);
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });

    // this.userService.create(this.user)
    //   .subscribe(
    //     data => {
    //       this.alertService.success('Registration successful', true);
    //       this.router.navigate(['/login']);
    //     },
    //     error => {
    //       this.alertService.error(error);
    //       this.loading = false;
    //     });
  }
}

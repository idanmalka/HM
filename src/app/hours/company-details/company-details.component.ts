import { Component, OnInit } from '@angular/core';

import { AlertService } from '../../shared/services/alert.service';
import { UserService } from '../../shared/services/user.service';
import { CompanyService } from '../../shared/services/company.service';
import {User} from "../../models/user";
import {Company} from "../../models/company";
import { AuthenticationService} from "../../shared/services/authentication.service";

@Component({
  selector: 'company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.less']
})

export class CompanyDetailsComponent implements OnInit {
  model: User;
  company: Company;
  loading = false;

  constructor(private authService: AuthenticationService,
              private companyService: CompanyService,
              private alertService: AlertService) { }

  ngOnInit(): void {
    this.model = this.authService.user;
    this.company = this.authService.company;
    console.log(this.model);

  }

  update() {
    this.loading = true;
    this.companyService.update(this.company)
      .subscribe(
        data => {
          this.alertService.success('Update successful', true);
          this.loading = false;
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }

}

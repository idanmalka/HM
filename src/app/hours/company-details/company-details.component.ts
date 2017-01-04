import {Component, OnInit} from '@angular/core';

import {AlertService} from '../../shared/services/alert.service';
import {UserService} from '../../shared/services/user.service';
import {CompanyService} from '../../shared/services/company.service';
import {User} from "../../models/user";
import {Company} from "../../models/company";
import {AuthenticationService} from "../../shared/services/authentication.service";

@Component({
  selector: 'company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.less']
})

export class CompanyDetailsComponent implements OnInit {
  model: User;
  company: Company;
  loading = false;

  years = [];
  months = [
    {value: 0, label: 'ינואר'},
    {value: 1, label: 'פברואר'},
    {value: 2, label: 'מרץ'},
    {value: 3, label: 'אפריל'},
    {value: 4, label: 'מאי'},
    {value: 5, label: 'יוני'},
    {value: 6, label: 'יולי'},
    {value: 7, label: 'אוגוסט'},
    {value: 8, label: 'ספטמבר'},
    {value: 9, label: 'אוקטובר'},
    {value: 10, label: 'נובמבר'},
    {value: 11, label: 'דצמבר'}
  ];
  chosenMonth: number = (new Date()).getMonth();
  chosenYear: number = (new Date()).getFullYear();

  constructor(private authService: AuthenticationService,
              private companyService: CompanyService,
              private alertService: AlertService) {
    this.model = this.authService.user;
    this.company = this.authService.company;
    this.company.visa.expirationDate = new Date(this.company.visa.expirationDate);
    for(let i = this.chosenYear - 10; i < this.chosenYear + 10; i++)
      this.years.push({value: i, label: i});
  }

  ngOnInit(): void {
    console.log(this.model);
    console.log(this.company);
    this.chosenMonth = this.company.visa.expirationDate.getMonth();
    this.chosenYear = this.company.visa.expirationDate.getFullYear();
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

  setExpParameter(param: string) {
    switch (param) {
      case 'month':
        this.company.visa.expirationDate.setMonth(this.chosenMonth);
        break;
      case 'year':
        this.company.visa.expirationDate.setFullYear(this.chosenYear);
        break;
    }
  }
}

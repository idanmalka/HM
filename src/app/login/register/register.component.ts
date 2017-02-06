import {Component} from '@angular/core';
import {DatePipe} from '@angular/common/src/pipes';
import {Router} from '@angular/router';

import {AlertService} from '../../shared/services/alert.service';
import {UserService} from '../../shared/services/user.service';
import {CompanyService} from '../../shared/services/company.service';
import {User} from "../../models/user";
import {Company} from "../../models/company";

@Component({
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less'],
  providers: [DatePipe]
})

export class RegisterComponent {
  model: User = new User();
  company: Company = new Company();
  loading = false;
  ExistUserNameFlag: boolean = false;
  visaExpirationDate: Date;

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

  constructor(private router: Router, private companyService: CompanyService, private userService: UserService, private alertService: AlertService) {
    this.visaExpirationDate = new Date();
    this.visaExpirationDate.setDate(1);
    for (let i = this.chosenYear - 10; i < this.chosenYear + 10; i++)
      this.years.push({value: i, label: i});
  }

  register() {

    this.loading = true;
    this.model.department = "הנהלה";
    this.model.role = "מנהל כללי";
    this.model.isAdmin = true;
    this.model.isManager = true;
    this.model.shifts = [];
    this.model.companyId = 0;
    this.company.employees = [];
    this.company.visa.expirationDate = this.visaExpirationDate.toISOString();

    this.companyService.create({company: this.company, user: this.model})
      .subscribe(
        data => {
          this.alertService.success('Registration Company successful', true);
          this.router.navigate(['/login']);
        },
        error => {
          this.alertService.error(error._body);
          this.loading = false;
        });

  }

  setExpParameter(param: string) {
    switch (param) {
      case 'month':
        this.visaExpirationDate.setMonth(this.chosenMonth);
        break;
      case 'year':
        this.visaExpirationDate.setFullYear(this.chosenYear);
        break;
    }
  }
}

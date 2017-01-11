import {Component, OnInit} from '@angular/core';

import {AlertService} from '../../shared/services/alert.service';
import {UserService} from '../../shared/services/user.service';
import {CompanyService} from '../../shared/services/company.service';
import {User} from "../../models/user";
import {Company} from "../../models/company";
import {AuthenticationService} from "../../shared/services/authentication.service";
import {Response} from "@angular/http";

@Component({
  selector: 'company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.less']
})

export class CompanyDetailsComponent implements OnInit {
  user: User;
  editableCompany: Company;
  loading = false;

  companies;
  dropdownCompanies = [{label: 'בחר חברה', value: new Company()}];

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
  }

  ngOnInit(): void {
    this.user = this.authService.user;
    this.editableCompany = this.authService.company;
    this.editableCompany.visa.expirationDate = new Date(this.editableCompany.visa.expirationDate);

    if(this.user.isAdmin)
      this.companyService.getAll().subscribe((data: Response) => {
        this.companies = data;
        for(let company of this.companies){
          this.dropdownCompanies.push({label:company.name, value: company});
        }
        console.log(this.companies);
      });

    for(let i = this.chosenYear - 10; i < this.chosenYear + 10; i++)
      this.years.push({value: i, label: i});
    console.log(this.user);
    console.log(this.editableCompany);
    this.chosenMonth = this.editableCompany.visa.expirationDate.getMonth();
    this.chosenYear = this.editableCompany.visa.expirationDate.getFullYear();
  }

  update() {
    this.loading = true;
    this.companyService.update(this.editableCompany)
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
        this.editableCompany.visa.expirationDate.setMonth(this.chosenMonth);
        break;
      case 'year':
        this.editableCompany.visa.expirationDate.setFullYear(this.chosenYear);
        break;
    }
  }

  setEditCompany(): void {
    this.editableCompany.visa.expirationDate = new Date(this.editableCompany.visa.expirationDate);
    this.chosenMonth = this.editableCompany.visa.expirationDate.getMonth();
    this.chosenYear = this.editableCompany.visa.expirationDate.getFullYear();
  }
}

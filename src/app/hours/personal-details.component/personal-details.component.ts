import { Component , OnInit } from '@angular/core';

import { AlertService } from '../../shared/services/alert.service';
import { UserService } from '../../shared/services/user.service';
import {User} from "../../models/user";
import {Company} from "../../models/company";
import { AuthenticationService} from "../../shared/services/authentication.service";
import {Response} from "@angular/http";
import {CompanyService} from "../../shared/services/company.service";

@Component({
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.less']
})

export class PersonalDetailsComponent implements OnInit{
    editableUser: User = new User();
    user: User = new User();
    loading = false;

    companies;
    dropdownCompanies = [{label: 'בחר חברה', value: new Company()}];
    companyUsers = [{label: 'בחר משתמש', value: new User()}];
    chosenCompany;
    chosenCompanyUser;

    constructor(
        private authService: AuthenticationService,
        private userService: UserService,
        private alertService: AlertService,
        private companyService: CompanyService) { }

    ngOnInit(): void {
      this.user = this.editableUser = this.authService.user;
      console.log(this.user? this.user : this.editableUser);

      if(this.user.isAdmin)
        this.companyService.getAll().subscribe((data: Response) => {
          this.companies = data;
          for(let company of this.companies){
            this.dropdownCompanies.push({label:company.name, value: company});
          }
          console.log(this.companies);
        });
    }

    update() {
    this.loading = true;
    this.userService.update(this.editableUser)
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

  setEditCompany(): void {
    this.companyUsers = [];
    this.companyUsers.push({label: 'בחר משתמש', value: new User()});
    for(let user of this.chosenCompany.employees)
      this.companyUsers.push({label: user.firstName + " " + user.lastName, value: user});
  }

  setEditableUser(): void {
    this.editableUser = Object.assign({},this.chosenCompanyUser);
  }
}

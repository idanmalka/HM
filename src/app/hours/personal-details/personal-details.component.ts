import {Component, OnInit} from '@angular/core';

import {AlertService} from '../../shared/services/alert.service';
import {UserService} from '../../shared/services/user.service';
import {User} from "../../models/user";
import {Company} from "../../models/company";
import {AuthenticationService} from "../../shared/services/authentication.service";
import {Response} from "@angular/http";
import {CompanyService} from "../../shared/services/company.service";

@Component({
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.less']
})

export class PersonalDetailsComponent implements OnInit {
  editableUser: User;
  user: User;
  loading = false;
  dirty = false;

  companies;
  dropdownCompanies = [{label: 'בחר חברה', value: new Company()}];
  companyUsers = [{label: 'בחר משתמש', value: new User()}];
  chosenCompany;

  constructor(private authService: AuthenticationService,
              private userService: UserService,
              private alertService: AlertService,
              private companyService: CompanyService) {
    this.user = this.editableUser = this.authService.user;
  }

  ngOnInit(): void {
    this.loading = true;
    this.userService.getById(this.authService.user.id).subscribe(user => {
      this.user = this.editableUser = user;
      this.authService.user = user;
    });

    if (this.user.isAdmin)
      this.companyService.getAll().subscribe((data: Response) => {
        this.companies = data;
        for (let company of this.companies) {
          if (company.id === this.user.companyId)
            this.chosenCompany = company;
          this.dropdownCompanies.push({label: company.name, value: company});
        }
        this.setEditCompany();

        this.loading = false;
      });
    else this.loading = false;
  }

  saveData() {
    this.loading = true;
    this.userService.update(this.editableUser)
      .subscribe(
        data => {
          this.alertService.success('עודכן בהצלחה', true);
          this.loading = false;
        },
        error => {
          this.alertService.error(error._body);
          this.loading = false;
        });
  }

  setEditCompany(): void {
    this.companyUsers = [];
    this.companyUsers.push({label: 'בחר משתמש', value: new User()});
    for (let user of this.chosenCompany.employees)
      this.companyUsers.push({label: user.firstName + " " + user.lastName, value: user});
    this.editableUser = this.user;
  }

  confirmNavigation(): boolean {
    if (this.dirty)
      this.alertService.error("אנא שמור/בטל את השינויים");
    return !this.dirty;
  }

  isPlaceHolderUser(): boolean {
    return this.editableUser.id === 0 || (this.chosenCompany && this.chosenCompany.id === 0);
  }
}

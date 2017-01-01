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

export class CompanyDetailsComponent implements OnInit{
    model: User = new User();
    company : Company = new Company();
    loading = false;
     rows: Array<any> = [];
     columns: Array<any> = [
        {title: 'שם פרטי', name: 'firstName'},
        {title: 'שם משפחה', name: 'lastName'},
        {title: 'מחלקה', name: 'department'},
        {title: 'תפקיד', name: 'role'},
        {title: 'דוא"ל', name: 'email'},
        {title: 'טלפון', name: 'phone'}
    ];
    page: number = 1; 
    itemsPerPage: number = 10; 
    length: number = 0;   
    config: any = {
    paging: true,
    sorting: {columns: this.columns},
    className: ['table-striped', 'table-bordered']
  };
    data: Array<any> = [];

    constructor(
        private authService: AuthenticationService,
        private companyService: CompanyService,
        private userService: UserService,
        private alertService: AlertService) { }

    ngOnInit(): void {
        this.model = this.authService.user;
        this.company = this.authService.company;
        console.log(this.model);
        this.initTableData();
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

   initTableData(): void {
    this.data = [];
    for (let user of this.company.employees) {
      let firstName = user.firstName; 
      let lastName = user.lastName;
      let department = user.department;
      let role = user.role;
      let email = user.email;
      let phone = user.phone;
     
      this.data.push({
          firstName: firstName,
          lastName: lastName,
          department: department,
          role: role,
          email: email,
          phone: phone
        });
    }
    this.onChangeTable(this.config);
  }   

  onChangeTable(config: any, page: any = {page: this.page, itemsPerPage: this.itemsPerPage}): any {
    if (config.sorting) {
      Object.assign(this.config.sorting, config.sorting);
    }
    let sortedData = this.changeSort(this.data, this.config);
    this.rows =  sortedData;
    this.length = sortedData.length;
  }

  changeSort(data: any, config: any): any {
    if (!config.sorting) {
      return data;
    }

    let columns = this.config.sorting.columns || [];
    let columnName: string = void 0;
    let sort: string = void 0;

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort !== '' && columns[i].sort !== false) {
        columnName = columns[i].name;
        sort = columns[i].sort;
      }
    }

    if (!columnName) {
      return data;
    }

    // simple sorting
    return data.sort((previous: any, current: any) => {
      if (previous[columnName] > current[columnName]) {
        return sort === 'desc' ? -1 : 1;
      } else if (previous[columnName] < current[columnName]) {
        return sort === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }
}

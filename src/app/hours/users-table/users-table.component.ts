import {Component, OnInit, ViewChild, Input} from '@angular/core';
import {Company} from "../../models/company";
import {User} from "../../models/user";
import {AuthenticationService} from "../../shared/services/authentication.service";
import {ModalDirective} from "ng2-bootstrap";

@Component({
  selector: 'users-table',
  templateUrl: 'users-table.component.html',
  styleUrls: ['users-table.component.less']
})
export class UsersTableComponent implements OnInit {
  @ViewChild('childModal') public childModal: ModalDirective;
  @Input() editable: boolean = false;
  user: User;
  company: Company;

  rows: Array<any> = [];
  columns: Array<any> = [
    {title: 'שם משפחה', name: 'lastName', sort: 'asc'},
    {title: 'שם פרטי', name: 'firstName', sort: ''},
    {title: 'מחלקה', name: 'department', sort: ''},
    {title: 'תפקיד', name: 'role', sort: ''},
    {title: 'דוא"ל', name: 'email', sort: ''},
    {title: 'טלפון', name: 'phone', sort: ''}
  ];
  page: number = 1;
  itemsPerPage: number = 10;
  maxSize: number = 5;
  numPages: number = 1;
  length: number = 0;
  checkedRow: number;

  modalUserName : string;
  modalPassword: string;
  modalFirstName: string;
  modalLastName: string;
  modalEmail : string;
  modalPhone: string;
  modalAddress: string;
  modalDepartment: string;
  modalRole: string;

  config: any = {
    filtering: {filterString: ""},
    paging: true,
    sorting: {columns: this.columns},
    className: ['table-striped', 'table-bordered']
  };
  data: Array<any> = [];

  constructor(private authService: AuthenticationService) {
  }

  ngOnInit(): void {
    this.length = this.data.length || 0;
    this.user = this.authService.user;
    this.company = this.authService.company;
    this.initTableData();
  }

  initTableData(): void {
    this.data = [];
    let index = 0;
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
        phone: phone,
        index: index++
      });
    }
    this.onChangeTable(this.config);
  }

  changePage(page: any, data: Array<any> = this.data): Array<any> {
    let start = (page.page - 1) * page.itemsPerPage;
    let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    return data.slice(start, end);
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

    //simple sorting
    return data.sort((previous: any, current: any) => {
      if (previous[columnName] > current[columnName]) {
        return sort === 'desc' ? -1 : 1;
      } else if (previous[columnName] < current[columnName]) {
        return sort === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }

  changeFilter(data: any, config: any): any {
    let filteredData: Array<any> = data;
    this.columns.forEach((column: any) => {
      if (column.filtering) {
        filteredData = filteredData.filter((item: any) => {
          return item[column.name].match(column.filtering.filterString);
        });
      }
    });

    if (!config.filtering) {
      return filteredData;
    }

    if (config.filtering.columnName) {
      return filteredData.filter((item: any) =>
        item[config.filtering.columnName].match(this.config.filtering.filterString));
    }

    let tempArray: Array<any> = [];
    filteredData.forEach((item: any) => {
      let flag = false;
      this.columns.forEach((column: any) => {
        if (item[column.name].toString().match(this.config.filtering.filterString)) {
          flag = true;
        }
      });
      if (flag) {
        tempArray.push(item);
      }
    });
    filteredData = tempArray;

    return filteredData;
  }

  onChangeTable(config: any, page: any = {page: this.page, itemsPerPage: this.itemsPerPage}): any {
    // if (config.filtering) {
    //   Object.assign(this.config.filtering, config.filtering);
    // }
    //
    // if (config.sorting) {
    //   Object.assign(this.config.sorting, config.sorting);
    // }

    let filteredData = this.changeFilter(this.data, this.config);
    let sortedData = this.changeSort(filteredData, this.config);
    this.rows = page && config.paging ? this.changePage(page, sortedData) : sortedData;
    this.length = sortedData.length;
  }

  addUser() {
    console.log("clicked add user");
    this.checkedRow = -1;
    this.updateModal();
    this.showChildModal();
   
  }

  updateModal(UserName="", Password = "", FirstName = "", LastName = "", Email = "" , Phone = "" , Address = "" , Department = "" , Role="") {
      this.modalUserName = UserName;
      this.modalPassword = Password;
      this.modalFirstName = FirstName;
      this.modalLastName = LastName;
      this.modalEmail = Email;
      this.modalPhone = Phone;
      this.modalAddress = Address;
      this.modalDepartment = Department;
      this.modalRole = Role;
  }
//////////
  confirmUser() {
    console.log('clicked confirm user');
  }
/////////
  deleteUser() {
    console.log('clicked delete user');
  }

  onCellClick(data: any): any {
    if (!this.user.isManager && !this.editable)
      return;

    console.log(data);
    this.checkedRow = data.row.index;
    this.updateModal(
        this.company.employees[this.checkedRow].username,
        this.company.employees[this.checkedRow].password,
        this.company.employees[this.checkedRow].firstName,
        this.company.employees[this.checkedRow].lastName,
        this.company.employees[this.checkedRow].email,
        this.company.employees[this.checkedRow].phone,
        this.company.employees[this.checkedRow].address,
        this.company.employees[this.checkedRow].department,
        this.company.employees[this.checkedRow].role, );
    this.showChildModal();
  }

  showChildModal(): void {
    this.childModal.config.backdrop = false;
    this.childModal.show();
  }

  hideChildModal(): void {
    this.childModal.hide();
  }

// לעשות בסוף
  // saveData(): void {
  //   console.log('updating user data');
  //   this.userService.update(this.user);
  // }


}

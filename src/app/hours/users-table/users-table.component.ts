import {Component, OnInit, ViewChild, Input} from '@angular/core';
import {Company} from "../../models/company";
import {User} from "../../models/user";
import {AuthenticationService} from "../../shared/services/authentication.service";
import {CompanyService} from '../../shared/services/company.service';
import {ModalDirective} from "ng2-bootstrap";
import {Response} from "@angular/http";
import * as FileSaver from "file-saver";

@Component({
  selector: 'users-table',
  templateUrl: 'users-table.component.html',
  styleUrls: ['users-table.component.less']
})
export class UsersTableComponent implements OnInit {
  @ViewChild('childModal') public childModal: ModalDirective;
  @Input() editable: boolean = false;

  user: User;
  editableCompany: Company = new Company();
  companies;
  dropdownCompanies = [{label: 'בחר חברה', value: new Company()}];
  editableCompanyEmployeesStackSave: Array<User[]> = [];

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

  modalUserName: string;
  modalPassword: string;
  modalFirstName: string;
  modalLastName: string;
  modalEmail: string;
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

  constructor(private authService: AuthenticationService,
              private companyService: CompanyService) {
  }

  ngOnInit(): void {
    this.length = this.data.length || 0;
    this.user = this.authService.user;
    this.editableCompany = this.authService.company;
    if (this.user.isAdmin)
      this.companyService.getAll().subscribe((data: Response) => {
        this.companies = data;
        for (let company of this.companies) {
          this.dropdownCompanies.push({label: company.name, value: company});
        }
        console.log(this.companies);
      });
    this.initTableData();
  }

  initTableData(): void {
    this.data = [];
    let index = 0;
    for (let user of this.editableCompany.employees) {
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

  updateModal(UserName = "", Password = "", FirstName = "", LastName = "", Email = "", Phone = "", Address = "", Department = "", Role = "") {
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

  confirmUser() {
    this.editableCompanyEmployeesStackSave.push(Object.assign({},this.editableCompany.employees));


    // ON EDIT THIS IS NOT SAVED AS NEW OBJECT, WHY?????


    console.log('clicked confirm user');
    this.updateDataFromModal();
    this.hideChildModal();
  }

  updateDataFromModal(): void {
    this.updateUsersData();
    this.initTableData();
  }

  updateUsersData(): void {
    let UserName = this.modalUserName;
    let Password = this.modalPassword;
    let FirstName = this.modalFirstName;
    let LastName = this.modalLastName;
    let Email = this.modalEmail;
    let Phone = this.modalPhone;
    let Address = this.modalAddress;
    let Department = this.modalDepartment;
    let Role = this.modalRole;

    if (this.checkedRow > -1) {
      this.editableCompany.employees[this.checkedRow].username = UserName;
      this.editableCompany.employees[this.checkedRow].password = Password;
      this.editableCompany.employees[this.checkedRow].firstName = FirstName;
      this.editableCompany.employees[this.checkedRow].lastName = LastName;
      this.editableCompany.employees[this.checkedRow].email = Email;
      this.editableCompany.employees[this.checkedRow].phone = Phone;
      this.editableCompany.employees[this.checkedRow].address = Address;
      this.editableCompany.employees[this.checkedRow].department = Department;
      this.editableCompany.employees[this.checkedRow].role = Role;
    } else {
      this.editableCompany.employees.push({
        id: -1, username: UserName, password: Password, firstName: FirstName,
        lastName: LastName, email: Email, phone: Phone, address: Address,
        department: Department, role: Role, isManager: false, isAdmin: false,
        companyId: this.editableCompany.employees[0].companyId, shifts: []
      });
    }
  }

  deleteUser() {
    this.editableCompanyEmployeesStackSave.push(Object.assign({},this.editableCompany.employees));
    this.editableCompany.employees.splice(this.checkedRow, 1);
    this.initTableData();
    this.hideChildModal();
  }

  onCellClick(data: any): any {
    if (!this.user.isManager && !this.editable)
      return;

    console.log(data);
    this.checkedRow = data.row.index;
    this.updateModal(
      this.editableCompany.employees[this.checkedRow].username,
      this.editableCompany.employees[this.checkedRow].password,
      this.editableCompany.employees[this.checkedRow].firstName,
      this.editableCompany.employees[this.checkedRow].lastName,
      this.editableCompany.employees[this.checkedRow].email,
      this.editableCompany.employees[this.checkedRow].phone,
      this.editableCompany.employees[this.checkedRow].address,
      this.editableCompany.employees[this.checkedRow].department,
      this.editableCompany.employees[this.checkedRow].role);
    this.showChildModal();
  }

  showChildModal(): void {
    this.childModal.config.backdrop = false;
    this.childModal.show();
  }

  hideChildModal(): void {
    this.childModal.hide();
  }

  saveData(): void {
    console.log('updating user data');
    this.companyService.updateCompanyUsers(this.editableCompany);
  }

  setEditCompany(): void {
    this.editableCompanyEmployeesStackSave = [];
    this.initTableData();
  }

  exportToCsv() {

    if (this.data.length === 0)
      return;

    const items = this.data;
    const replacer = (key, value) => value === null ? '' : value;// specify how you want to handle null values here
    const header = Object.keys(items[0]);
    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csv1 = csv.join('\r\n');

    console.log(csv1);

    var blob = new Blob([csv1], {type: "text/csv;charset=utf-8"});
    FileSaver.saveAs(blob, 'רשימת עובדים - ' + this.editableCompany.name + '.csv');
  }

  undoListChange(){
    if (this.editableCompanyEmployeesStackSave.length > 0) {
      console.log('poping');
      this.editableCompany.employees = [];
      Object.assign(this.editableCompany.employees, this.editableCompanyEmployeesStackSave.pop());
      this.initTableData();
    }
    else console.log('not poping');
  }
}

import {Component, OnInit, ViewChild, Input} from '@angular/core';
import {Company} from "../../models/company";
import {User} from "../../models/user";
import {AuthenticationService} from "../../shared/services/authentication.service";
import {UserService} from '../../shared/services/user.service';
import {CompanyService} from '../../shared/services/company.service';
import {ModalDirective} from "ng2-bootstrap";
import {Response} from "@angular/http";
import * as FileSaver from "file-saver";
import {FormGroup} from '@angular/forms';

enum CRUD{
  'CREATE',
  'UPDATE',
  'DELETE'
}

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
  editableCompanyEmployeesStackSave: Array<{ users: User[], state: CRUD }> = [];
  deletedUsersArray: Array<number> = [];

  columns: Array<any> = [
    {header: 'שם משפחה', field: 'lastName'},
    {header: 'שם פרטי', field: 'firstName'},
    {header: 'מחלקה', field: 'department'},
    {header: 'תפקיד', field: 'role'},
    {header: 'דוא"ל', field: 'email'},
    {header: 'טלפון', field: 'phone'}
  ];
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
  modalExistUserNameFlag: boolean = false;

  data: Array<any> = [];

  constructor(private authService: AuthenticationService,
              private companyService: CompanyService,
              private userService: UserService) {
  }

  ngOnInit(): void {
    this.user = this.authService.user;
    this.editableCompany = this.authService.company;
    if (this.user.isAdmin)
      this.companyService.getAll().subscribe((data: Response) => {
        this.companies = data;
        for (let company of this.companies) {
          this.dropdownCompanies.push({label: company.name, value: company});
        }
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
  }


  addUser() {
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

  confirmUser(modalForm: FormGroup) {
    if (modalForm.valid) {
      this.editableCompanyEmployeesStackSave.push(
        {
          users: jQuery.extend(true, {}, this.editableCompany.employees),
          state: CRUD.UPDATE
        });
      this.updateDataFromModal();
    }
  }

  updateDataFromModal(): void {

    if (this.checkedRow < 0)
      if (this.isUserNameExistInLocalTable()) {
        this.modalExistUserNameFlag = true;
        return;
      }

    this.updateUsersData();
    this.initTableData();
    this.hideChildModal();

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

  isUserNameExistInLocalTable(): boolean {
    if (this.modalUserName === '') return false;
    for (let user of this.editableCompany.employees)
      if (user.username === this.modalUserName)
        return true;
    return false;
  }

  deleteUser() {
    this.deletedUsersArray.push(this.editableCompany.employees[this.checkedRow].id);
    this.editableCompanyEmployeesStackSave.push(
      {
        users: jQuery.extend(true, {},
          this.editableCompany.employees), state: CRUD.DELETE
      });
    this.editableCompany.employees.splice(this.checkedRow, 1);
    this.initTableData();
    this.hideChildModal();
  }

  onCellClick(data: any): any {
    if (!this.user.isManager && !this.editable)
      return;

    this.checkedRow = data.data.index;
    this.modalExistUserNameFlag = false;
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
    this.userService.deleteMultiple(this.deletedUsersArray);
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

    var blob = new Blob([csv1], {type: "text/csv;charset=utf-8"});
    FileSaver.saveAs(blob, 'רשימת עובדים - ' + this.editableCompany.name + '.csv');
  }

  undoListChange() {
    if (this.editableCompanyEmployeesStackSave.length <= 0)
      return;

    this.editableCompany.employees = [];
    let stackTop = this.editableCompanyEmployeesStackSave.pop();

    jQuery.extend(true, this.editableCompany.employees, stackTop.users);

    if (stackTop.state === CRUD.DELETE)
      this.deletedUsersArray.pop();

    this.initTableData();

  }
}

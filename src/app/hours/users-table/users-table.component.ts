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
import {AlertService} from "../../shared/services/alert.service";

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
  @Input() editable: boolean = true;

  user: User;
  editableCompany: Company = new Company();
  companies;
  dropdownCompanies = [{label: 'בחר חברה', value: new Company()}];
  editableCompanyEmployeesStackSave: Array<{users: User[], state: CRUD}> = [];
  deletedUsersArray: Array<number> = [];
  dirty = false;
  loading: boolean = false;

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
  modalIsManager: boolean = false;
  modalIsAdmin: boolean = false;

  data: Array<any> = [];


  constructor(private authService: AuthenticationService,
              private companyService: CompanyService,
              private userService: UserService,
              private alertService: AlertService) {
    this.user = this.authService.user;
  }

  ngOnInit(): void {
    this.loading = true;
    this.editableCompany = new Company();
    this.initTableData();

    this.userService.getById(this.authService.user.id).subscribe(user => {
      this.user = user;
      this.authService.user = user;
    });

    if (this.user.isAdmin)
      this.companyService.getAll().subscribe((data: Response) => {
        this.companies = data;
        for (let company of this.companies) {
          if (company.id === this.user.companyId)
            this.editableCompany = company;
          this.dropdownCompanies.push({label: company.name, value: company});
        }
        this.initTableData();
        this.loading = false;
      });
    else
      this.companyService.getById(this.authService.user.companyId).subscribe(company => {
        this.editableCompany = company;
        this.initTableData();
        this.loading = false;
      });
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

  updateModal(UserName = "", Password = "", FirstName = "", LastName = "", Email = "", Phone = "", Address = "", Department = "", Role = "", isManager = false, isAdmin = false) {
    this.modalUserName = UserName;
    this.modalPassword = Password;
    this.modalFirstName = FirstName;
    this.modalLastName = LastName;
    this.modalEmail = Email;
    this.modalPhone = Phone;
    this.modalAddress = Address;
    this.modalDepartment = Department;
    this.modalRole = Role;
    this.modalIsManager = isManager;
    this.modalIsAdmin = isAdmin;
  }

  confirmUser(modalForm: FormGroup) {
    if (modalForm.valid) {
      this.editableCompanyEmployeesStackSave.push(
        {
          users: $.extend(true, {}, this.editableCompany.employees),
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
    this.dirty = true;
    let UserName = this.modalUserName;
    let Password = this.modalPassword;
    let FirstName = this.modalFirstName;
    let LastName = this.modalLastName;
    let Email = this.modalEmail;
    let Phone = this.modalPhone;
    let Address = this.modalAddress;
    let Department = this.modalDepartment;
    let Role = this.modalRole;
    let isAdmin = this.modalIsAdmin;
    let isManager = this.modalIsManager;

    let curUser = this.editableCompany.employees[this.checkedRow];
    if (this.checkedRow > -1) {
      curUser.username = UserName;
      curUser.password = Password;
      curUser.firstName = FirstName;
      curUser.lastName = LastName;
      curUser.email = Email;
      curUser.phone = Phone;
      curUser.address = Address;
      curUser.department = Department;
      curUser.role = Role;
      curUser.isAdmin = isAdmin;
      curUser.isManager = isManager;
    } else {
      this.editableCompany.employees.push({
        id: -2,
        username: UserName,
        password: Password,
        firstName: FirstName,
        lastName: LastName,
        email: Email,
        phone: Phone,
        address: Address,
        department: Department,
        role: Role,
        isManager: isManager,
        isAdmin: isAdmin,
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
    this.dirty = true;
    this.deletedUsersArray.push(this.editableCompany.employees[this.checkedRow].id);
    this.editableCompanyEmployeesStackSave.push(
      {
        users: $.extend(true, {},
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
    let employee = this.editableCompany.employees[this.checkedRow];
    this.updateModal(
      employee.username,
      employee.password,
      employee.firstName,
      employee.lastName,
      employee.email,
      employee.phone,
      employee.address,
      employee.department,
      employee.role,
      employee.isManager,
      employee.isAdmin);

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
    this.dirty = false;
    this.loading = true;
    if (this.deletedUsersArray.length > 0)
      this.userService.deleteMultiple(this.deletedUsersArray);
    this.companyService.updateCompanyUsers(this.editableCompany).subscribe(
      data => {
        this.loading = false;
        this.alertService.success("הנתונים עודכנו בהצלחה");
      },
      error => {
        this.loading = false;
        this.alertService.error("אירעה שגיאה");
      }
    );
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
    if (this.editableCompanyEmployeesStackSave.length <= 0) {
      this.dirty = false;
      return;
    }
    this.editableCompany.employees = [];
    let stackTop = this.editableCompanyEmployeesStackSave.pop();

    $.extend(true, this.editableCompany.employees, stackTop.users);

    if (stackTop.state === CRUD.DELETE)
      this.deletedUsersArray.pop();

    if (this.editableCompanyEmployeesStackSave.length <= 0)
      this.dirty = false;

    this.initTableData();

  }

  confirmNavigation(): boolean {
    if (this.dirty)
      this.alertService.error("אנא שמור/בטל את השינויים");
    return !this.dirty;
  }

  isPlaceHolderCompany(): boolean {
    return this.user.isAdmin && this.editableCompany.id === 0;
  }

  isSelf(): boolean {
    return this.editableCompany.employees[this.checkedRow].id === this.user.id;
  }
}

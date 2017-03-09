import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from "../../shared/services/authentication.service";
import {User} from "../../models/user";
import {UserService} from "../../shared/services/user.service";
import {Shift} from "../../models/shift";
import {ModalDirective} from "ng2-bootstrap";
import {UIChart} from "primeng/components/chart/chart";
import * as FileSaver from "file-saver";
import {Message} from 'primeng/primeng';
import {Company} from "../../models/company";
import {CompanyService} from "../../shared/services/company.service";
import {Response} from "@angular/http";
import {AlertService} from "../../shared/services/alert.service";

@Component({
  selector: 'home-page',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.less']
})
export class HomeComponent implements OnInit {
  @ViewChild('childModal') public childModal: ModalDirective;
  @ViewChild('chart') public chart: UIChart;

  companies;
  dropdownCompanies = [{label: 'בחר חברה', value: new Company()}];
  companyUsers = [{label: 'בחר משתמש', value: new User()}];
  chosenCompany;

  loading: boolean = false;
  dirty: boolean = false;
  editableUser: User = new User();
  user: User;
  editableUserShiftsStackSave: Array<Shift[]> = [];
  displayCalendar: boolean = false;
  msgs: Message[] = [];
  chosenMonth: number = (new Date()).getMonth();
  chosenYear: number = (new Date()).getFullYear();

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

  columns: Array<any> = [
    {header: 'תאריך', field: 'date'},
    {header: 'שעת התחלה', field: 'startHour'},
    {header: 'שעת סיום', field: 'endHour'},
    {header: 'סה"כ שעות', field: 'totalHours'},
    {header: 'הערות', field: 'comment'}
  ];

  checkedRow: number;
  data: Array<any> = [];

  modalStartHour: Date;
  modalEndHour: Date;
  modalDate: Date = new Date();
  modalComment: string;

  showDailyHoursChart: boolean = false;
  chartData: any;
  shiftsPerDay: boolean[] = [];

  constructor(private authenticationService: AuthenticationService,
              private alertService: AlertService,
              private userService: UserService,
              private companyService: CompanyService) {
    this.user = this.editableUser = this.authenticationService.user;
  }

  ngOnInit() {
    this.loading = true;
    for (let i = this.chosenYear - 10; i < this.chosenYear + 10; i++)
      this.years.push({value: i, label: i});

    this.initTableData();

    this.userService.getById(this.authenticationService.user.id).subscribe(user => {
      this.user = this.editableUser = user;
      console.log("from hours management:",user);
      this.authenticationService.user = user;
    });

    if (this.user.isAdmin) {
      this.companyService.getAll().subscribe((data: Response) => {
        this.companies = data;
        for (let company of this.companies) {
          if (company.id === this.user.companyId)
            this.chosenCompany = company;
          this.dropdownCompanies.push({label: company.name, value: company});
        }

        this.setEditCompany(this.user);
        this.initTableData();
        this.loading = false;
      });
    } else this.loading = false;

  }

  confirmNavigation(): boolean {
    if (this.dirty)
      this.alertService.error("אנא שמור/בטל את השינויים");
    return !this.dirty;
  }


  initTableData(): void {
    this.data = [];
    let index = 0;
    for (let i = 0; i < 32; i++)
      this.shiftsPerDay[i] = false;

    for (let shift of this.editableUser.shifts) {
      let start = new Date(shift.start);
      let end = new Date(shift.end);
      let date = new Date(shift.date);
      if (date.getMonth() === this.chosenMonth && date.getFullYear() === this.chosenYear) {

        let dateStr = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        let startStr = start.getHours() + ":" + start.getMinutes();
        let endStr = end.getHours() + ":" + end.getMinutes();
        let diff = new Date(Math.abs(end.getTime() - start.getTime()));
        let totalHoursStr = (diff.getHours() - 2) + ":" + diff.getMinutes();
        let comment = shift.comment;

        let currentDate = date.getDate();
        this.shiftsPerDay[currentDate] = true;

        this.data.push({
          index: index,
          date: dateStr,
          startHour: startStr,
          endHour: endStr,
          totalHours: totalHoursStr,
          comment: comment
        });
      }
      index++;
    }
    setTimeout(this.initChartData(), 100);
  }

  initChartData(): void {
    let data = [];
    let chartLabels = [];
    let lastDayOfMonth = (new Date(this.chosenYear, this.chosenMonth + 1, 0)).getDate();
    for (let i = 1; i <= lastDayOfMonth; i++) {
      chartLabels.push(i.toString());
      for (let row of this.data) {
        if (+row.date.split("/")[0] === i) {
          let totalArr = row.totalHours.split(":");
          let sum = +totalArr[0] + (+totalArr[1]) / 60;
          data.push(sum);
        }
      }
      if (data.length < i)
        data.push(0);
    }
    this.chartData = {
      labels: chartLabels,
      datasets: [
        {
          label: 'התפלגות שעות לימים',
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          data: data
        }]
    };

    setTimeout(() => {
      if (this.chart)
        this.chart.refresh();
    }, 100);
  }

  updateUserShifts() {
    this.dirty = true;
    this.editableUserShiftsStackSave.push($.extend(true, {}, this.editableUser.shifts));
    let start = new Date(this.modalStartHour).toISOString();
    let end = new Date(this.modalEndHour).toISOString();
    let date = new Date(this.modalDate).toISOString();

    if (this.checkedRow > -1) {
      this.editableUser.shifts[this.checkedRow].start = start;
      this.editableUser.shifts[this.checkedRow].end = end;
      this.editableUser.shifts[this.checkedRow].date = date;
      this.editableUser.shifts[this.checkedRow].comment = this.modalComment;
    } else {
      if (this.isExistShiftInChosenDay()) {
        for (let shift of this.editableUser.shifts)
          if (shift.date === date) {
            shift.start = start;
            shift.end = end;
            shift.date = date;
            shift.comment = this.modalComment;
            break;
          }
      }
      else this.editableUser.shifts.push({start: start, end: end, date: date, comment: this.modalComment});
    }
  }

  changeSort($event): any {

    let columnName: string = $event.field;
    let sort: number = $event.order;
    let data = this.data || [];

    return data.sort((previous: any, current: any) => {
      if (columnName !== "date") {
        if (+(previous[columnName].split(":")[0]) > +(current[columnName].split(":")[0]))
          return sort === -1 ? -1 : 1;
        if (+(previous[columnName].split(":")[0]) < +(current[columnName].split(":")[0]))
          return sort === 1 ? -1 : 1;
        if (+(previous[columnName].split(":")[1]) > +(current[columnName].split(":")[1]))
          return sort === -1 ? -1 : 1;
        if (+(previous[columnName].split(":")[1]) < +(current[columnName].split(":")[1]))
          return sort === 1 ? -1 : 1;
        return 0;
      } else {
        if (+(previous[columnName].split("/")[0]) > +(current[columnName].split("/")[0])) {
          return sort === -1 ? -1 : 1;
        } else if (+(previous[columnName].split("/")[0]) < +(current[columnName].split("/")[0])) {
          return sort === 1 ? -1 : 1;
        }
        return 0;
      }
    });
  }

  onRowClick(data: any): any {
    this.checkedRow = data.data.index;
    let start: Date = new Date(this.editableUser.shifts[this.checkedRow].start);
    let end: Date = new Date(this.editableUser.shifts[this.checkedRow].end);
    let date: Date = new Date(this.editableUser.shifts[this.checkedRow].date);
    this.updateModal(start, end, date, this.editableUser.shifts[this.checkedRow].comment);
    this.showChildModal();
  }

  toggleCalendar(): void {
    this.showDailyHoursChart = false;
    this.displayCalendar = !this.displayCalendar;
  }

  toggleDailyHoursChart(): void {
    this.displayCalendar = false;
    this.showDailyHoursChart = !this.showDailyHoursChart;
  }

  addShift(): void {
    this.checkedRow = -1;
    this.updateModal();
    this.showChildModal();
  }

  saveData(): void {
    this.dirty = false;
    this.userService.update(this.editableUser).subscribe(
      data => this.alertService.success('נשמר בהצלחה', true),
      error => this.alertService.error(error._body)
    );
  }

  updateModal(startHour = new Date(), endHour = new Date(), date = new Date(), comment = "") {
    if (this.checkedRow === -1) {
      if (this.chosenMonth !== date.getMonth() || this.chosenYear !== date.getFullYear()) {
        date.setDate(1);
        date.setFullYear(this.chosenYear);
      }
      date.setMonth(this.chosenMonth);
    }

    this.modalStartHour = new Date(startHour);
    this.modalEndHour = new Date(endHour);
    this.modalDate = new Date(date);
    this.modalComment = comment;
  }

  showChildModal(): void {
    this.childModal.config.backdrop = false;
    this.childModal.show();
  }

  hideChildModal(): void {
    this.childModal.hide();
  }

  getDate(): Date {
    return this.modalDate || new Date();
  }

  confirmShift(): boolean {
    this.updateDataFromModal();
    this.hideChildModal();
    return false;
  }

  updateDataFromModal(): void {
    this.updateUserShifts();
    this.initTableData();
  }

  deleteShift(): void {
    this.editableUserShiftsStackSave.push($.extend(true, {}, this.editableUser.shifts));
    this.editableUser.shifts.splice(this.checkedRow, 1);
    this.initTableData();
    this.hideChildModal();
  }

  exportToCsv() {
    if (this.dirty) {
      this.msgs.push({severity: 'info', summary: '', detail: 'אנא שמור לפני ההורדה'})
      return;
    }
    if (this.data.length > 0) {
      const items = this.data;
      const replacer = (key, value) => value === null ? '' : value;
      const header = Object.keys(items[0]);
      let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
      csv.unshift(header.join(','));
      let csv1 = csv.join('\r\n');

      var blob = new Blob([csv1], {type: "text/csv;charset=utf-8"});
      FileSaver.saveAs(blob, 'דיווחי שעות ' + this.months[this.chosenMonth].label + '/' + this.chosenYear + '.csv');
    } else this.msgs.push({severity: 'info', summary: '', detail: 'אין דיווחים לשמירה'})

  }

  undoShiftChange() {
    if (this.editableUserShiftsStackSave.length <= 0) {
      return;
    }
    this.editableUser.shifts = [];
    $.extend(true, this.editableUser.shifts, this.editableUserShiftsStackSave.pop());

    if (this.editableUserShiftsStackSave.length === 0)
      this.dirty = false;

    this.initTableData();

  }

  setEditCompany(user?: User): void {
    this.companyUsers = [];
    this.companyUsers.push({label: 'בחר משתמש', value: new User()});

    if (user)
      this.editableUser = user;
    else
      this.editableUser = this.companyUsers[0].value;

    for (let user of this.chosenCompany.employees)
      this.companyUsers.push({label: user.firstName + " " + user.lastName, value: user});
    this.initTableData();
    this.dirty = false;
  }

  setEditableUser(): void {
    this.editableUserShiftsStackSave = [];
    this.initTableData();
    this.dirty = false;
  }

  isExistShiftInChosenDay(): boolean {
    let currentDate = this.modalDate.getDate();
    return this.shiftsPerDay[currentDate].valueOf();
  }

  isPlaceHolderUser(): boolean {
    return this.editableUser.id === 0 || (this.chosenCompany && this.chosenCompany.id === 0);
  }
}

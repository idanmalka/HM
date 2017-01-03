import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from "../../shared/services/authentication.service";
import {Router} from "@angular/router";
import {User} from "../../models/user";
import {UserService} from "../../shared/services/user.service";
import {Shift} from "../../models/shift";
import {ModalDirective} from "ng2-bootstrap";
import {UIChart} from "primeng/components/chart/chart";

@Component({
  selector: 'home-page',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.less']
})
export class HomeComponent implements OnInit {
  @ViewChild('childModal') public childModal: ModalDirective;
  @ViewChild('chart') public chart: UIChart;

  user: User;
  displayCalendar: boolean = false;

  chosenMonth: number = (new Date()).getMonth();
  chosenYear: number = (new Date()).getFullYear();

  years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
  months = [
    {value: 0, name: 'ינואר'},
    {value: 1, name: 'פברואר'},
    {value: 2, name: 'מרץ'},
    {value: 3, name: 'אפריל'},
    {value: 4, name: 'מאי'},
    {value: 5, name: 'יוני'},
    {value: 6, name: 'יולי'},
    {value: 7, name: 'אוגוסט'},
    {value: 8, name: 'ספטמבר'},
    {value: 9, name: 'אוקטובר'},
    {value: 10, name: 'נובמבר'},
    {value: 11, name: 'דצמבר'}
  ];

  rows: Array<any> = [];
  columns: Array<any> = [
    {title: 'תאריך', name: 'date', sort: "desc"},
    {title: 'שעת התחלה', name: 'startHour', sort:''},
    {title: 'שעת סיום', name: 'endHour', sort:''},
    {title: 'סה"כ שעות', name: 'totalHours', sort: ''},
    {title: 'הערות', name: 'comment', sort: ''}
  ];
  page: number = 1;
  itemsPerPage: number = 10;
  maxSize: number = 5;
  numPages: number = 1;
  length: number = 0;
  checkedRow: number;
  config: any = {
    filtering: {filterString: ""},
    paging: true,
    sorting: {columns: this.columns},
    className: ['table-striped', 'table-bordered']
  };
  data: Array<any> = [];

  modalStartHour: Date;
  modalEndHour: Date;
  modalDate: Date;
  modalComment: string;

  showDailyHoursChart: boolean = false;
  chartData: any;
  filteredSortedData = [];

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private userService: UserService) {
    this.length = this.data.length || 0;
    this.user = this.authenticationService.user;
    console.log(this.user);
  }

  ngOnInit() {
    this.initTableData();
    this.initChartData();
  }

  initTableData(): void {
    this.data = [];
    let index = 0;
    for (let shift of this.user.shifts) {
      let start = new Date(shift.start);
      let end = new Date(shift.end);
      let date = new Date(shift.date);
      console.log(date.getMonth());
      if (date.getMonth() === this.chosenMonth && date.getFullYear() === this.chosenYear) {

        let dateStr = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        let startStr = start.getHours() + ":" + start.getMinutes();
        let endStr = end.getHours() + ":" + end.getMinutes();
        let diff = new Date(Math.abs(end.getTime() - start.getTime()));
        let totalHoursStr = (diff.getHours() - 2) + ":" + diff.getMinutes();
        let comment = shift.comment;

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
    this.onChangeTable(this.config);
    //this.initChartData();
   //this.chart.refresh();
  }

  initChartData(): void{
    let data = [];
    let chartLabels = [];
    let lastDayOfMonth = (new Date(this.chosenYear,this.chosenMonth+1,0)).getDate();
    for(let i = 1; i <= lastDayOfMonth; i++){
      chartLabels.push(i.toString());
      for(let row of this.filteredSortedData){
        if (+row.date.split("/")[0] === i) {
          let totalArr = row.totalHours.split(":");
          let sum = +totalArr[0] + (+totalArr[1])/60;
          data.push(sum);
        }
      }
      if(data.length < i)
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
        }]};
  }

  updateUserShifts() {
    let start = new Date(this.modalStartHour);
    let end = new Date(this.modalEndHour);
    let date = new Date(this.modalDate);

    if (this.checkedRow > -1) {
      this.user.shifts[this.checkedRow].start = start;
      this.user.shifts[this.checkedRow].end = end;
      this.user.shifts[this.checkedRow].date = date;
      this.user.shifts[this.checkedRow].comment = this.modalComment;
    } else {
      this.user.shifts.push({start: start, end: end, date: date, comment: this.modalComment});
    }
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
      if (columnName !== "date") {
        if (previous[columnName] > current[columnName]) {
          return sort === 'desc' ? -1 : 1;
        } else if (previous[columnName] < current[columnName]) {
          return sort === 'asc' ? -1 : 1;
        }
        return 0;
      } else {
        if (+(previous[columnName].split("/")[0]) > +(current[columnName].split("/")[0])) {
          return sort === 'desc' ? -1 : 1;
        } else if (+(previous[columnName].split("/")[0]) < +(current[columnName].split("/")[0])) {
          return sort === 'asc' ? -1 : 1;
        }
        return 0;
      }
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
    Object.assign(this.filteredSortedData,sortedData);
    this.rows = page && config.paging ? this.changePage(page, sortedData) : sortedData;
    this.length = sortedData.length;
  }

  onCellClick(data: any): any {
    console.log(data);
    this.checkedRow = data.row.index;
    this.updateModal(this.user.shifts[this.checkedRow].start,
      this.user.shifts[this.checkedRow].end,
      this.user.shifts[this.checkedRow].date,
      this.user.shifts[this.checkedRow].comment);
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
    console.log("clicked add shift");
    this.checkedRow = -1;
    this.updateModal();
    this.showChildModal();
  }

  saveData(): void {
    console.log('updating user data');
    this.userService.update(this.user);
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
    console.log("submitted");
    this.updateDataFromModal();
    this.hideChildModal();
    return false;
  }

  updateDataFromModal(): void {
    console.log(this.modalStartHour);
    console.log(this.modalEndHour);
    console.log(this.modalDate);
    console.log(this.checkedRow);
    this.updateUserShifts();
    this.initTableData();
  }

  deleteShift(): void {
    this.user.shifts.splice(this.checkedRow, 1);
    this.initTableData();
    this.hideChildModal();
  }

  print(a) {
    console.log(a.getDate());
    console.log(this.modalDate);
  }

  update(chart){
    this.initChartData();
    chart.refresh();
  }
}

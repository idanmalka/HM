import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from "../../shared/services/authentication.service";
import {Router} from "@angular/router";
import {User} from "../../models/user";
import {UserService} from "../../shared/services/user.service";
import {Shift} from "../../models/shift";
import {ModalDirective} from "ng2-bootstrap";

@Component({
  selector: 'home-page',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.less']
})
export class HomeComponent implements OnInit {
  @ViewChild('childModal') public childModal:ModalDirective;
  user: User;
  displayCalendar: boolean = false;

  rows: Array<any> = [];
  columns: Array<any> = [
    {title: 'תאריך', name: 'date'},
    {title: 'שעת התחלה', name: 'startHour'},
    {title: 'שעת סיום', name: 'endHour'},
    {title: 'סה"כ שעות', name: 'totalHours'},
    {title: 'הערות', name: 'comment'}
  ];
  page: number = 1;
  itemsPerPage: number = 10;
  maxSize: number = 3;
  numPages: number = 1;
  length: number = 0;
  checkedRow: number;

  config: any = {
    paging: true,
    sorting: {columns: this.columns},
    className: ['table-striped', 'table-bordered']
  };

  private data: Array<any> = [];

  modalStartHour: Date;
  modalEndHour: Date;
  modalDate: Date;
  modalComment: string;
  public options:any = {
    hstep: [1, 2, 3],
    mstep: [1, 5, 10, 15, 25, 30]
  };

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private userService: UserService) {
    this.length = this.data.length || 0;
    this.user = this.authenticationService.user;
    console.log(this.user);
  }

  ngOnInit() {
    this.initTableData();
  }

  initTableData(): void {
    this.data = [];
    let index = 0;
    for (let shift of this.user.shifts) {
      let start = new Date(shift.start);
      let end = new Date(shift.end);
      let date = new Date(shift.date);
      let dateStr : string = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
      let startStr = start.getHours() + ":" + start.getMinutes();
      let endStr = end.getHours() + ":" + end.getMinutes();
      let diff = new Date(Math.abs(end.getTime() - start.getTime()));
      let totalHoursStr = diff.getHours() + ":" + diff.getMinutes();
      let comment = shift.comment;

      this.data.push({index:index++, date: dateStr, startHour: startStr, endHour: endStr, totalHours: totalHoursStr, comment: comment})
    }
    this.onChangeTable(this.config);
  }

  updateUserShifts(){
    let start = new Date(this.modalStartHour);
    let end = new Date(this.modalEndHour);
    let date = new Date(this.modalDate);

    if (this.checkedRow > -1) {
      this.user.shifts[this.checkedRow].start = new Date(this.modalStartHour);
      this.user.shifts[this.checkedRow].end = new Date(this.modalEndHour);
      this.user.shifts[this.checkedRow].date = new Date(this.modalDate);
      this.user.shifts[this.checkedRow].comment = this.modalComment;
    }else {
      this.user.shifts.push({start: start, end:end, date: date, comment:this.modalComment});
    }
  }

  updateTableData(){

    let dateStr = this.modalDate.getDate() + "/" + (this.modalDate.getMonth() + 1) + "/" + this.modalDate.getFullYear();
    let startStr = this.modalStartHour.getHours() + ":" + this.modalStartHour.getMinutes();
    let endStr = this.modalEndHour.getHours() + ":" + this.modalEndHour.getMinutes();
    let diff = new Date(Math.abs(this.modalEndHour.getTime() - this.modalStartHour.getTime()));
    let totalHoursStr = diff.getHours() + ":" + diff.getMinutes();

    if (this.checkedRow > -1){
      let row = this.data.find((val,i,arr) => { return val.index === this.checkedRow; });
      row.date = dateStr;
      row.startHour = startStr;
      row.endHour = endStr;
      row.totalHours = totalHoursStr;
      row.comment = this.modalComment;
    }else{
      let index = this.data.length;
      this.data.push({index:index, date: dateStr, startHour: startStr, endHour: endStr, totalHours: totalHoursStr, comment: this.modalComment});
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

    if (config.sorting) {
      Object.assign(this.config.sorting, config.sorting);
    }

    // let filteredData = this.changeFilter(this.data, this.config);
    // let sortedData = this.changeSort(filteredData, this.config);
    let sortedData = this.changeSort(this.data, this.config);
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
    this.displayCalendar = !this.displayCalendar;
  }

  addShift(): void {
    console.log("clicked add shift");
    this.checkedRow = -1;
    this.updateModal();
    this.showChildModal();
  }

  editShift(): void {
    console.log("clicked edit shift");
  }

  refreshPage(): void {
    this.router.navigate(['/']);
  }

  saveData(): void {
    console.log('updating user data');
    this.userService.update(this.user);
  }

  updateModal(startHour = new Date(), endHour = new Date(), date = new Date(), comment = ""){
    this.modalStartHour = new Date(startHour);
    this.modalEndHour = new Date(endHour);
    this.modalDate = new Date(date);
    this.modalComment = comment;
  }

  showChildModal():void {
    this.childModal.config.backdrop = false;
    this.childModal.show();
  }

  hideChildModal():void {
    this.childModal.hide();
  }

  public getDate():Date {
    return this.modalDate || new Date();
  }

  confirmShift() : boolean {
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
    this.updateTableData();
  }

  print(a) {
    console.log(a.getDate());
    console.log(this.modalDate);
  }
}

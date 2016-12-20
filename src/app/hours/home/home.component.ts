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
    let index = 0;
    for (let shift of this.user.shifts) {
      let start = new Date(shift.start);
      let end = new Date(shift.end);
      let date: string = start.getDate() + "/" + (start.getMonth() + 1) + "/" + start.getFullYear();
      let startHour = start.getHours() + ":" + start.getMinutes();
      let endHour = end.getHours() + ":" + end.getMinutes();
      let diff = new Date(Math.abs(end.getTime() - start.getTime()));
      let totalHours = diff.getHours() + ":" + diff.getMinutes();
      let comment = shift.comment;

      this.data.push({index:index++, date: date, startHour: startHour, endHour: endHour, totalHours: totalHours, comment: comment})
    }
    this.onChangeTable(this.config);
  }

  public changePage(page: any, data: Array<any> = this.data): Array<any> {
    let start = (page.page - 1) * page.itemsPerPage;
    let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    return data.slice(start, end);
  }

  public changeSort(data: any, config: any): any {
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

  public changeFilter(data: any, config: any): any {
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

  public onChangeTable(config: any, page: any = {page: this.page, itemsPerPage: this.itemsPerPage}): any {
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

  public onCellClick(data: any): any {
    console.log(data);
    this.checkedRow = data.row.index;
    this.updateModal(data.row.startHour, data.row.endHour, data.row.date, data.row.comment);
    this.showChildModal();
  }

  toggleCalendar(): void {
    this.displayCalendar = !this.displayCalendar;
  }

  addShift(): void {
    console.log("clicked add shift");
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

  updateModal(startHour = void 0, endHour = void 0, date = void 0, comment = void 0){
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

  confirmShift() : boolean {
    console.log("submitted");
    return true;
  }
}

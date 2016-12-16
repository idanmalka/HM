import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "../../shared/services/authentication.service";
import { Router } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../shared/services/user.service";
import {Shift} from "../../models/shift";
import {forEach} from "@angular/router/src/utils/collection";

@Component({
  selector: 'home-page',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.less']
})
export class HomeComponent implements OnInit{
  user: User;
  displayCalendar: boolean = false;

  rows:Array<any> = [];
  columns:Array<any> = [
    {title: 'תאריך', name: 'date'},
    {title: 'שעת התחלה', name: 'startHour'},
    {title: 'שעת סיום', name: 'endHour'},
    {title: 'סה"כ שעות', name: 'totalHours'},
    {title: 'הערות', name: 'comment'}
  ];
  page:number = 1;
  itemsPerPage:number = 10;
  maxSize:number = 5;
  numPages:number = 1;
  length:number = 0;

  config:any = {
    paging: true,
    sorting: {columns: this.columns},
    className: ['table-striped', 'table-bordered']
  };

  private data:Array<any> = [];

  constructor(private authenticationService : AuthenticationService,
              private router: Router,
              private userService: UserService){
    this.length = this.data.length || 0;
  }

  ngOnInit(){
    this.user = this.userService.getCurrentUser().user;
    console.log(this.user);
    this.user.shifts = [
      {start:new Date(0), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "},
      {start:new Date(), end:new Date(), comment:" "}
    ];

    for(let shift of this.user.shifts){
      let date:string = shift.start.getDate()+"/"+(shift.start.getMonth()+1)+"/"+shift.start.getFullYear();
      let startHour = shift.start.getHours()+":"+shift.start.getMinutes();
      let endHour = shift.end.getHours()+":"+shift.end.getMinutes();
      let diff = new Date(Math.abs(shift.end.getTime() - shift.start.getTime()));
      let totalHours = diff.getHours()+":"+diff.getMinutes();
      let comment = shift.comment;

      this.data.push({ date:date,startHour:startHour,endHour:endHour,totalHours:totalHours,comment:comment })
    }
    this.onChangeTable(this.config);
  }

  public changePage(page:any, data:Array<any> = this.data):Array<any> {
    let start = (page.page - 1) * page.itemsPerPage;
    let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    return data.slice(start, end);
  }

  public changeSort(data:any, config:any):any {
    if (!config.sorting) {
      return data;
    }

    let columns = this.config.sorting.columns || [];
    let columnName:string = void 0;
    let sort:string = void 0;

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
    return data.sort((previous:any, current:any) => {
      if (previous[columnName] > current[columnName]) {
        return sort === 'desc' ? -1 : 1;
      } else if (previous[columnName] < current[columnName]) {
        return sort === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }

  public changeFilter(data:any, config:any):any {
    let filteredData:Array<any> = data;
    this.columns.forEach((column:any) => {
      if (column.filtering) {
        filteredData = filteredData.filter((item:any) => {
          return item[column.name].match(column.filtering.filterString);
        });
      }
    });

    if (!config.filtering) {
      return filteredData;
    }

    if (config.filtering.columnName) {
      return filteredData.filter((item:any) =>
        item[config.filtering.columnName].match(this.config.filtering.filterString));
    }

    let tempArray:Array<any> = [];
    filteredData.forEach((item:any) => {
      let flag = false;
      this.columns.forEach((column:any) => {
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

  public onChangeTable(config:any, page:any = {page: this.page, itemsPerPage: this.itemsPerPage}):any {
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
  }




  toggleCalendar() : void {
    this.displayCalendar = !this.displayCalendar;
  }

  addShift() :void {
    console.log("clicked add shift");
  }

  editShift() :void{
    console.log("clicked edit shift");
  }
}

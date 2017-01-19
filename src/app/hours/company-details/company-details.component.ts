import {Component, OnInit,ViewChild} from '@angular/core';

import {AlertService} from '../../shared/services/alert.service';
import {UserService} from '../../shared/services/user.service';
import {CompanyService} from '../../shared/services/company.service';
import {User} from "../../models/user";
import {Company} from "../../models/company";
import {AuthenticationService} from "../../shared/services/authentication.service";
import {Response} from "@angular/http";
import {UIChart} from "primeng/components/chart/chart";


@Component({
  selector: 'company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.less']
})

export class CompanyDetailsComponent implements OnInit {
  @ViewChild('chart') public chart: UIChart;
  user: User;
  editableCompany: Company;
  loading = false;

  companies;
  dropdownCompanies = [{label: 'בחר חברה', value: new Company()}];

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
  chosenMonth: number = (new Date()).getMonth();
  chosenYear: number = (new Date()).getFullYear();
  chartData: any;

  constructor(private authService: AuthenticationService,
              private companyService: CompanyService,
              private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.user = this.authService.user;
    this.editableCompany = this.authService.company;
    this.editableCompany.visa.expirationDate = new Date(this.editableCompany.visa.expirationDate);

    if(this.user.isAdmin)
      this.companyService.getAll().subscribe((data: Response) => {
        this.companies = data;
        for(let company of this.companies){
          this.dropdownCompanies.push({label:company.name, value: company});
        }
        console.log(this.companies);
      });

    for(let i = this.chosenYear - 10; i < this.chosenYear + 10; i++)
      this.years.push({value: i, label: i});
    console.log(this.user);
    console.log(this.editableCompany);
    this.chosenMonth = this.editableCompany.visa.expirationDate.getMonth();
    this.chosenYear = this.editableCompany.visa.expirationDate.getFullYear();
    // this.initChartData();
    setTimeout(this.initChartData(), 100);  
  }

  update() {
    this.loading = true;
    this.companyService.update(this.editableCompany)
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

  setExpParameter(param: string) {
    switch (param) {
      case 'month':
        this.editableCompany.visa.expirationDate.setMonth(this.chosenMonth);
        break;
      case 'year':
        this.editableCompany.visa.expirationDate.setFullYear(this.chosenYear);
        break;
    }
  }

  setEditCompany(): void {
    this.editableCompany.visa.expirationDate = new Date(this.editableCompany.visa.expirationDate);
    this.chosenMonth = this.editableCompany.visa.expirationDate.getMonth();
    this.chosenYear = this.editableCompany.visa.expirationDate.getFullYear();
  }

 initChartData(): void {
    let data = [];
    let backgroundColors =[];
    let chartLabels = [];
    let currentDate = new Date();
    let localUser = new User();
    console.log("today day :");
    console.log(currentDate.getDate());

    for ( let i=0; i<this.editableCompany.employees.length ; i++ ){
    // for (let employee of this.editableCompany.employees) {
      localUser = this.editableCompany.employees[i];
      chartLabels.push(localUser.firstName + " " + localUser.lastName);
      let totalSum = 0;
      for(let j=0; j<localUser.shifts.length ; j++)
      // for (let shift of localUser.shifts)
      {   
        let date = new Date(localUser.shifts[j].date);
        let localMonth = date.getMonth();
        let localYear = date.getFullYear();
        if ( localMonth === currentDate.getMonth() && localYear === currentDate.getFullYear())
        {
            let start = new Date(localUser.shifts[j].start);
            let end = new Date(localUser.shifts[j].end);
            let diff = new Date(Math.abs(end.getTime() - start.getTime()));

            let sum = diff.getHours() - 2 + (diff.getMinutes()) / 60; 
            totalSum+= sum;       
        }
      }
      data.push(totalSum);
    }

    for (let i = 0; i < this.editableCompany.employees.length; ) 
    {
      //generate random color
      let str = '#' + Math.floor(Math.random() * 16777215).toString(16);
      // validation check - is real color?
      let isOk  = /^#[0-9A-F]{6}$/i.test(str) ;
      if (isOk === true)
      {
        backgroundColors.push(str);
        i++;
      }
    }



        this.chartData = {
          labels: chartLabels,
          datasets: [
            {
              label: 'פילוח שעות לפי עובדים',
              backgroundColor: backgroundColors ,
              borderColor: '#1E88E5',
              data: data
            }]
        };

        setTimeout(() => {
          if (this.chart)
            this.chart.refresh();
        }, 100);
      }
}

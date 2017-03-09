import {Component, OnInit, ViewChild} from '@angular/core';
import {AlertService} from '../../shared/services/alert.service';
import {CompanyService} from '../../shared/services/company.service';
import {User} from "../../models/user";
import {Company} from "../../models/company";
import {AuthenticationService} from "../../shared/services/authentication.service";
import {Response} from "@angular/http";
import {UIChart} from "primeng/components/chart/chart";
import {UserService} from "../../shared/services/user.service";


@Component({
  selector: 'company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.less']
})

export class CompanyDetailsComponent implements OnInit {
  @ViewChild('chart') public chart: UIChart;
  @ViewChild('chart2') public chart2: UIChart;

  user: User;
  editableCompany: Company = new Company();
  loading = false;
  visaExpirationDate: Date;
  dirty = false;

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
  chosenGraphMonth: number = (new Date()).getMonth();
  chosenGraphYear: number = (new Date()).getFullYear();
  chartData: any;
  chartData2: any;
  data2 = [];
  chartLabels2 = [];

  openDeleteCompanyDialog: boolean = false;

  constructor(private authService: AuthenticationService,
              private companyService: CompanyService,
              private userService: UserService,
              private alertService: AlertService) {
    this.user = authService.user;
  }

  ngOnInit(): void {
    this.visaExpirationDate = new Date();
    this.loading = true;

    this.userService.getById(this.authService.user.id).subscribe(user => {
      this.user = user;
      this.authService.user = user;
    });

    if (this.user.isAdmin)
      this.companyService.getAll().subscribe((data: Response) => {
        console.log("after getall im company details");
        console.log(data);
        this.updateCompaniesDropdown(data);
        this.initChartData();
        this.initChartData2();
        this.loading = false;
        console.log("yes admin visa expiration date: ", this.visaExpirationDate);
      });
    else this.companyService.getById(this.authService.user.companyId).subscribe(company => {
      this.editableCompany = company;
      this.visaExpirationDate = new Date(this.editableCompany.visa.expirationDate);
      this.chosenMonth = this.visaExpirationDate.getMonth();
      this.chosenYear = this.visaExpirationDate.getFullYear();
      this.initChartData();
      this.loading = false;
      console.log("not admin visa expiration date: ", this.visaExpirationDate);
    });

    for (let i = this.chosenYear - 10; i < this.chosenYear + 10; i++)
      this.years.push({value: i, label: i});

  }

  updateCompaniesDropdown(data) {
    this.companies = data;
    this.dropdownCompanies = [{label: 'בחר חברה', value: new Company()}];
    this.chartLabels2 = [];
    this.data2 = [];
    for (let company of this.companies) {
      if (company.id === this.user.companyId) {
        this.editableCompany = company;
        this.visaExpirationDate = new Date(this.editableCompany.visa.expirationDate);
      }
      this.dropdownCompanies.push({label: company.name, value: company});
      this.chartLabels2.push(company.name);
      this.data2.push(company.employees.length);
    }

    this.chosenMonth = this.visaExpirationDate.getMonth();
    this.chosenYear = this.visaExpirationDate.getFullYear();

    if (this.user.isManager || this.user.isAdmin)
      setTimeout(this.initChartData(), 100);

    if (this.user.isAdmin)
      setTimeout(this.initChartData2(), 100);
  }

  saveData() {
    this.loading = true;
    this.editableCompany.visa.expirationDate = this.visaExpirationDate.toISOString();
    this.companyService.update(this.editableCompany)
      .subscribe(
        data => {
          this.alertService.success('עודכן בהצלחה', false);
          this.loading = false;
        },
        error => {
          this.alertService.error(error._body);
          this.loading = false;
        });
  }

  setExpParameter(param: string) {
    switch (param) {
      case 'month':
        this.visaExpirationDate.setMonth(this.chosenMonth);
        break;
      case 'year':
        this.visaExpirationDate.setFullYear(this.chosenYear);
        break;
    }
  }

  setEditCompany(): void {
    this.visaExpirationDate = new Date(this.editableCompany.visa.expirationDate);
    this.chosenMonth = this.visaExpirationDate.getMonth();
    this.chosenYear = this.visaExpirationDate.getFullYear();
    this.initChartData();
  }

  generateRandomColor(): Array<any> {
    let colors = [];
    for (let i = 0; i < this.editableCompany.employees.length;) {
      //generate random color
      let str = '#' + Math.floor(Math.random() * 16777215).toString(16);
      // validation check - is real color?
      let isOk = /^#[0-9A-F]{6}$/i.test(str);
      if (isOk) {
        colors.push(str);
        i++;
      }
    }
    return colors;
  }


  initChartData(): void {
    let data = [];
    let chartLabels = [];
    let currentDate = new Date();
    currentDate.setMonth(this.chosenGraphMonth);
    currentDate.setFullYear(this.chosenGraphYear);
    let localUser = new User();

    for (let i = 0; i < this.editableCompany.employees.length; i++) {
      localUser = this.editableCompany.employees[i];
      chartLabels.push(localUser.firstName + " " + localUser.lastName);
      let totalSum = 0;
      for (let j = 0; j < localUser.shifts.length; j++) {
        let date = new Date(localUser.shifts[j].date);
        let localMonth = date.getMonth();
        let localYear = date.getFullYear();
        if (localMonth === currentDate.getMonth() && localYear === currentDate.getFullYear()) {
          let start = new Date(localUser.shifts[j].start);
          let end = new Date(localUser.shifts[j].end);
          let diff = new Date(Math.abs(end.getTime() - start.getTime()));

          totalSum += diff.getHours() - 2 + (diff.getMinutes()) / 60;
        }
      }
      data.push(totalSum);
    }

    this.chartData = {
      labels: chartLabels,
      datasets: [
        {
          label: 'פילוח שעות לפי עובדים',
          backgroundColor: this.generateRandomColor(),
          borderColor: '#1E88E5',
          data: data
        }]
    };

    setTimeout(() => {
        this.chart.refresh();
    }, 100);

  }

  initChartData2(): void {
    this.chartData2 = {
      labels: this.chartLabels2,
      datasets: [
        {
          label: 'מעקב משתמשים לחברות',
          backgroundColor: this.generateRandomColor(),
          borderColor: '#1E88E5',
          data: this.data2
        }]
    };

    setTimeout(() => this.chart2.refresh(), 100);
  }

  deleteCompany(): void {
    this.companyService.delete(this.editableCompany.id).subscribe(
      data => {
        let index = this.companies.indexOf(this.editableCompany);
        this.companies.splice(index, 1);
        this.editableCompany = new Company();
        this.updateCompaniesDropdown(this.companies);
        this.alertService.success("החברה נמחקה בהצלחה")
      },
      error => {
        this.alertService.error("המחיקה נכשלה");
      }
    );
    this.openDeleteCompanyDialog = false;
  }

  confirmNavigation(): boolean {
    if (this.dirty)
      this.alertService.error("אנא שמור/בטל את השינויים");
    return !this.dirty;
  }

  isPlaceHolderCompany(): boolean {
    return this.editableCompany.id === 0;
  }
}




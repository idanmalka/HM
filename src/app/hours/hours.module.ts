import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AuthGuard } from "./guards/auth.guard";
import { SharedModule } from "../shared/shared.module";
import { TooltipModule } from 'ng2-bootstrap/ng2-bootstrap';
import { NewEmployeeComponent } from "./new-employee/new-employee.component";
import { CompanyDetailsComponent } from "./company-details/company-details.component";
import {PersonalDetailsComponent} from "./personal-details.component/personal-details.component";


@NgModule({
  declarations: [
    HomeComponent,
    NewEmployeeComponent,
    CompanyDetailsComponent,
    PersonalDetailsComponent
  ],
  providers: [ AuthGuard ],
  imports: [
    TooltipModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: HomeComponent, canActivate: [AuthGuard] },
      { path: 'new-employee', component: NewEmployeeComponent, canActivate: [AuthGuard]},
      { path: 'company-details', component: CompanyDetailsComponent, canActivate: [AuthGuard]},
      { path: 'personal-details', component: PersonalDetailsComponent, canActivate: [AuthGuard]}
    ])
  ],
  exports: [ HomeComponent ]
})
export class HoursModule{ }

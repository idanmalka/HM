import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from "./guards/auth.guard";
import { SharedModule } from "../shared/shared.module";
import { TooltipModule } from 'ng2-bootstrap/ng2-bootstrap';
import { EmployeesManagingComponent } from "./employees-managing/employees-managing.component";
import { CompanyDetailsComponent } from "./company-details/company-details.component";
import { PersonalDetailsComponent } from "./personal-details.component/personal-details.component";
import { UsersTableComponent } from "./users-table/users-table.component";
import { ToolbarModule } from 'primeng/primeng';


@NgModule({
  declarations: [
    HomeComponent,
    EmployeesManagingComponent,
    CompanyDetailsComponent,
    PersonalDetailsComponent,
    UsersTableComponent
  ],
  providers: [ AuthGuard ],
  imports: [
    ToolbarModule,
    TooltipModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: HomeComponent, canActivate: [AuthGuard] },
      { path: 'employees-managing', component: EmployeesManagingComponent, canActivate: [AuthGuard]},
      { path: 'company-details', component: CompanyDetailsComponent, canActivate: [AuthGuard]},
      { path: 'personal-details', component: PersonalDetailsComponent, canActivate: [AuthGuard]}
    ])
  ],
  exports: [ HomeComponent ]
})
export class HoursModule{ }

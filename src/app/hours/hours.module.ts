import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AuthGuard } from "./guards/auth.guard";
import { SharedModule } from "../shared/shared.module";
import { TooltipModule } from 'ng2-bootstrap/ng2-bootstrap';
import { newEmployeeComponent } from "./new-employee/new-employee.component";


@NgModule({
  declarations: [
    HomeComponent,
    newEmployeeComponent
  ],
  providers: [ AuthGuard ],
  imports: [
    TooltipModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: HomeComponent, canActivate: [AuthGuard] },
      { path: 'new-employee', component: newEmployeeComponent, canActivate: [AuthGuard]}
    ])
  ],
  exports: [ HomeComponent ],
})
export class HoursModule{ }

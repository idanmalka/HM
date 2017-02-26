import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from "./guards/auth.guard";
import { SharedModule } from "../shared/shared.module";
import { TooltipModule } from 'ng2-bootstrap/ng2-bootstrap';
import { CompanyDetailsComponent } from "./company-details/company-details.component";
import { PersonalDetailsComponent } from "./personal-details/personal-details.component";
import { UsersTableComponent } from "./users-table/users-table.component";
import { ToolbarModule, DataTableModule, DialogModule, ConfirmDialogModule, ConfirmationService } from 'primeng/primeng';
import {SaveGuard} from "./guards/save.guard";


@NgModule({
  declarations: [
    HomeComponent,
    CompanyDetailsComponent,
    PersonalDetailsComponent,
    UsersTableComponent
  ],
  providers: [ AuthGuard, SaveGuard, ConfirmationService ],
  imports: [
    ConfirmDialogModule,
    DialogModule,
    DataTableModule,
    ToolbarModule,
    TooltipModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: HomeComponent, canActivate: [AuthGuard], canDeactivate: [SaveGuard] },
      { path: 'employees-managing', component: UsersTableComponent, canActivate: [AuthGuard], canDeactivate: [SaveGuard] },
      { path: 'company-details', component: CompanyDetailsComponent, canActivate: [AuthGuard], canDeactivate: [SaveGuard] },
      { path: 'personal-details', component: PersonalDetailsComponent, canActivate: [AuthGuard], canDeactivate: [SaveGuard] }
    ])
  ],
  exports: [ HomeComponent ]
})
export class HoursModule{ }

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AuthGuard } from "./guards/auth.guard";
import { SharedModule } from "../shared/shared.module";
import { TooltipModule } from 'ng2-bootstrap/ng2-bootstrap';

@NgModule({
  declarations: [
                  HomeComponent,
  ],
  providers: [ AuthGuard ],
  imports: [
    TooltipModule,
    SharedModule,
    RouterModule.forChild([ { path: '', component: HomeComponent, canActivate: [AuthGuard] }
    ])
  ],
  exports: [ HomeComponent ],
})
export class HoursModule{ }

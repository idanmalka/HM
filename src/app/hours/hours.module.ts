import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AuthGuard } from "./guards/auth.guard";
import {SharedModule} from "../shared/shared.module";

@NgModule({
  declarations: [
                  HomeComponent,
  ],
  providers: [ AuthGuard ],
  imports: [
    SharedModule,
    RouterModule.forChild([ { path: '', component: HomeComponent, canActivate: [AuthGuard] }
    ])
  ],
  exports: [ HomeComponent ],
})
export class HoursModule{ }

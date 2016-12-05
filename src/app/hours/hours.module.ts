import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AuthGuard } from "./guards/auth.guard";

@NgModule({
  declarations: [
                  HomeComponent,
  ],
  providers: [ AuthGuard ],
  imports: [
    RouterModule.forChild([ { path: '', component: HomeComponent, canActivate: [AuthGuard] }
    ])
  ],
  exports: [ HomeComponent ],
})
export class HoursModule{ }

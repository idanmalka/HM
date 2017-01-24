import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HoursModule } from "./hours/hours.module";

import { AppComponent } from './app.component';
import { SharedModule } from "./shared/shared.module";
import { LoginModule } from "./login/login.module";

import { GatewayConfig } from "./app.config";


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    HoursModule,
    SharedModule,
    LoginModule,
    RouterModule.forRoot([
      { path: '**', redirectTo: '' }
    ])
  ],
  providers: [ GatewayConfig ],
  bootstrap: [AppComponent]
})
export class AppModule { }

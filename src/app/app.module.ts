import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HoursModule } from "./hours/hours.module";

import { AppComponent } from './app.component';
import { SharedModule } from "./shared/shared.module";
import { LoginModule } from "./login/login.module";
import { BaseRequestOptions } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { fakeBackendProvider } from "./_helpers/fake-backend";


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    HoursModule,
    SharedModule,
    LoginModule,
    RouterModule.forRoot([
      // otherwise redirect to home
      { path: '**', redirectTo: '' }
    ])
  ],
  providers: [
    // providers used to create fake backend
    fakeBackendProvider,
    MockBackend,
    BaseRequestOptions
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

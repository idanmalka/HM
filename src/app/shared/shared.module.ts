import {NgModule} from "@angular/core";
import {HeaderComponent} from "./header/header.component";
import {AlertService} from "./services/alert.service";
import {UserService} from "./services/user.service";
import {HttpModule} from "@angular/http";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AlertComponent} from "./alert/alert.component";

@NgModule({
  declarations: [
    HeaderComponent,
    AlertComponent
  ],
  imports: [BrowserModule,
            FormsModule,
            HttpModule],
  providers: [ AlertService, UserService],
  exports: [HeaderComponent,
            BrowserModule,
            FormsModule,
            HttpModule,
            AlertComponent]
})
export class SharedModule {

}

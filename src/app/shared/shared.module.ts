import {NgModule} from "@angular/core";
import {HeaderComponent} from "./header/header.component";
import {AlertService} from "./services/alert.service";
import {UserService} from "./services/user.service";
import {HttpModule} from "@angular/http";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AlertComponent} from "./alert/alert.component";
import { AuthenticationService } from "./services/authentication.service";
import { DatepickerModule, PaginationModule } from 'ng2-bootstrap/ng2-bootstrap';



@NgModule({
  declarations: [
    HeaderComponent,
    AlertComponent
  ],
  imports: [BrowserModule,
            FormsModule,
            HttpModule,
            DatepickerModule,
            PaginationModule
  ],
  providers: [ AlertService, UserService, AuthenticationService],
  exports: [HeaderComponent,
            BrowserModule,
            FormsModule,
            HttpModule,
            DatepickerModule,
            PaginationModule,
            AlertComponent]
})
export class SharedModule {

}

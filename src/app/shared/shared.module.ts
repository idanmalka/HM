import {NgModule} from "@angular/core";
import {HeaderComponent} from "./header/header.component";
import {AlertService} from "./services/alert.service";
import {UserService} from "./services/user.service";
import {CompanyService} from "./services/company.service";
import {HttpModule} from "@angular/http";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AlertComponent} from "./alert/alert.component";
import { AuthenticationService } from "./services/authentication.service";
import { DatepickerModule, PaginationModule, ModalModule, TimepickerModule } from 'ng2-bootstrap/ng2-bootstrap';
import { Ng2TableModule } from 'ng2-table/ng2-table';
import { ChartModule } from 'primeng/primeng';

@NgModule({
  declarations: [
    HeaderComponent,
    AlertComponent
  ],
  imports: [BrowserModule,
            FormsModule,
            HttpModule,
  ],
  providers: [ AlertService, UserService, CompanyService, AuthenticationService],
  exports: [HeaderComponent,
            BrowserModule,
            FormsModule,
            HttpModule,
            DatepickerModule,
            PaginationModule,
            Ng2TableModule,
            ModalModule,
            AlertComponent,
            TimepickerModule,
            ChartModule]
})
export class SharedModule {

}

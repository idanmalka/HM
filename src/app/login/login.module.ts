import { NgModule } from "@angular/core";
import { LoginComponent } from "./login.component";
import { SharedModule } from "../shared/shared.module";
import { RegisterComponent } from "./register/register.component";
import { AuthenticationService } from "./services/authentication.service";
import {RouterModule} from "@angular/router";

@NgModule({
  declarations: [ LoginComponent, RegisterComponent ],
  imports: [
    SharedModule,
    RouterModule.forChild([ { path: 'login', component: LoginComponent },
                           { path: 'register', component: RegisterComponent }])
  ],
  providers: [ AuthenticationService ],
  exports: []
})
export class LoginModule{

}

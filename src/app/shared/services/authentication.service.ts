import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { User } from "../../models/user";
import { Company } from "../../models/company";
import {GatewayConfig} from "../../app.config";

@Injectable()
export class AuthenticationService {
  user = new User();
  company = new Company();
  isLoggedIn: boolean = false;
  private baseUrl: string;

  constructor(private http: Http, private gatewayConfig: GatewayConfig) {
    this.baseUrl = `http://${gatewayConfig.ip}:${gatewayConfig.port}`;
  }


    login(username: string, password: string) {
    return this.http.post(this.baseUrl+'/api/authenticate', { username: username, password: password })
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        let obj = response.json();
        let user = obj.user;
        let company = obj.company;
        if (obj && obj.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('currentUserToken',JSON.stringify(obj.token));
          localStorage.setItem('currentCompany', JSON.stringify(company));
          localStorage.setItem('isLoggedIn','true');
          this.user = <User> Object.assign({},user);
          this.company = <Company> Object.assign({},company);
          this.isLoggedIn = true;
        }
      });
  }

  validate() :boolean {
    this.isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (this.isLoggedIn) {
      let user = JSON.parse(localStorage.getItem('currentUser'));
      let company = JSON.parse(localStorage.getItem('currentCompany'));
      this.user = jQuery.extend(true, {}, user);
      this.company = jQuery.extend(true, {}, company);
    }
   return this.isLoggedIn;
  }

  logout() {
    // remove user from local storage to log user out
    this.isLoggedIn = false;
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentCompany');
  }
}

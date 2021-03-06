import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { User } from "../../models/user";
import {GatewayConfig} from "../../app.config";

@Injectable()
export class AuthenticationService {
  user = new User();
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
        if (obj && obj.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('currentUserToken',JSON.stringify(obj.token));
          localStorage.setItem('isLoggedIn','true');
          this.user = <User> $.extend(true, {}, user);
          this.isLoggedIn = true;
        }
      });
  }

  validate() :boolean {
    this.isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (this.isLoggedIn) {
      let user = JSON.parse(localStorage.getItem('currentUser'));
      this.user = $.extend(true, {}, user);
    }
   return this.isLoggedIn;
  }

  logout() {
    // remove user from local storage to log user out
    this.isLoggedIn = false;
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem('currentUser');
  }
}

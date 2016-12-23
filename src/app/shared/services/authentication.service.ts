import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { User } from "../../models/user";


@Injectable()
export class AuthenticationService {
  user = new User();
  isLoggedIn: boolean = false;

  constructor(private http: Http) {

  }


    login(username: string, password: string) {
    return this.http.post('/api/authenticate', JSON.stringify({ username: username, password: password }))
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        let user = response.json();
        if (user && user.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem("isLoggedIn", "true");
          this.user = <User> Object.assign({},user.user);
          this.isLoggedIn = true;
        }
      });
  }

  validate() :boolean {
    this.isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (this.isLoggedIn) {
      let user = JSON.parse(localStorage.getItem('currentUser'));
      this.user = <User> Object.assign({}, user.user);
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

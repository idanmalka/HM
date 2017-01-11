import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { User } from '../../models/user';
import { Company } from '../../models/company';

@Injectable()
export class UserService {
  constructor(private http: Http) { }

  getAll() {
    return this.http.get('/api/users', this.jwt()).map((response: Response) => response.json());
  }

  getById(id: number) {
    return this.http.get('/api/users/' + id, this.jwt()).map((response: Response) => response.json());
  }

  create(user: User) {
    return this.http.post('/api/users', user, this.jwt()).map((response: Response) => response.json());
  }

  update(updatedUser: User) {
    let user = JSON.parse(localStorage['currentUser']);
    if (user.id === updatedUser.id)
      localStorage.setItem('currentUser',JSON.stringify(updatedUser));
    return this.http.put('/api/users/'+updatedUser.id, updatedUser, this.jwt()).map((response: Response) => response.json());
  }

  delete(id: number) {
    return this.http.delete('/api/users/' + id, this.jwt()).map((response: Response) => response.json());
  }

  getCurrentUser(){
    if (localStorage.getItem("currentUser") === null)
      return;
    let user = JSON.parse(localStorage['currentUser']);
    if (user && user.token) return user;
  }

  isUserNameExist(username : string){
    return this.http.post('/api/userNameExist', username, this.jwt()).map((response: Response) => response.json());
  }


  // private helper methods

  private jwt() {
    // create authorization header with jwt token
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
      return new RequestOptions({ headers: headers });
    }
  }
}

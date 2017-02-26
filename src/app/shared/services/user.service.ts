import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { GatewayConfig } from '../../app.config';

import { User } from '../../models/user';
import { Company } from '../../models/company';

@Injectable()
export class UserService {
  private baseUrl: string;

  constructor(private http: Http, private gatewayConfig: GatewayConfig) {
    this.baseUrl = `http://${gatewayConfig.ip}:${gatewayConfig.port}`;
  }

  getAll() {
    return this.http.get(this.baseUrl+'/api/users', this.jwt()).map((response: Response) => response.json());
  }

  getById(id: number) {
    return this.http.get(this.baseUrl+'/api/users/' + id, this.jwt()).map((response: Response) => response.json());
  }

  create(user: User) {
    return this.http.post(this.baseUrl+'/api/users', user, this.jwt());//.map((response: Response) => response.json());
  }

  update(updatedUser: User) {
    let user = JSON.parse(localStorage['currentUser']);
    if (user.id === updatedUser.id)
      localStorage.setItem('currentUser',JSON.stringify(updatedUser));
//
    let company = JSON.parse(localStorage.getItem('currentCompany'));
    if (company.id === updatedUser.companyId) {
      for ( let i=0; i < company.employees.length; i++)
        if (company.employees[i].id === user.id )
        {
          company.employees[i] = updatedUser;
          break;
        }
      localStorage.setItem('currentCompany', JSON.stringify(company));
    }
    //
    return this.http.put(this.baseUrl+'/api/users/'+updatedUser.id, updatedUser, this.jwt());//.map((response: Response) => response.json());
  }

  delete(id: number) {
    return this.http.delete(this.baseUrl+'/api/users/' + id, this.jwt());//.map((response: Response) => response.json());
  }

  deleteMultiple(ids: Array<number>) {
    return this.http.post(this.baseUrl+'/api/users/-1', ids, this.jwt());//.map((response: Response) => response.json());
  }

  getCurrentUser(){
    if (localStorage.getItem(this.baseUrl+"currentUser") === null)
      return;
    let user = JSON.parse(localStorage['currentUser']);
    if (user && user.token) return user;
  }


  // private helper methods

  private jwt() {
    // create authorization header with jwt token
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let currentToken = JSON.parse(localStorage.getItem('currentUserToken'));
    if (currentUser && currentToken) {
      let headers = new Headers({ 'token': currentToken });
      return new RequestOptions({ headers: headers });
    }
  }
}

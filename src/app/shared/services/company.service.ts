import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response} from '@angular/http';
import { GatewayConfig } from '../../app.config';

import {Company} from '../../models/company';
import {User} from "../../models/user";

class CompanyManagement{
  company: Company;
  user: User;
  adminCode: string;
}

@Injectable()
export class CompanyService {
  private baseUrl: string;

  constructor(private http: Http, private gatewayConfig: GatewayConfig) {
    this.baseUrl = `http://${gatewayConfig.ip}:${gatewayConfig.port}`;
  }

  create(companyManagement: CompanyManagement) {
    return this.http.post(this.baseUrl+'/api/companies', companyManagement, this.jwt());
  }

  update(updatedCompany: Company) {
    let company = JSON.parse(localStorage.getItem('currentCompany'));
    if (company.id === updatedCompany.id)
      localStorage.setItem('currentCompany', JSON.stringify(updatedCompany));
    return this.http.put(this.baseUrl+'/api/companies/' + updatedCompany.id, updatedCompany, this.jwt());
  }

  updateCompanyUsers(updatedCompany: Company) {
    let company = JSON.parse(localStorage.getItem('currentCompany'));
    if (company.id === updatedCompany.id) {
      company.employees = updatedCompany.employees;
      localStorage.setItem('currentCompany', JSON.stringify(company));
    }
    return this.http.put(this.baseUrl+'/api/companyUsers/'+updatedCompany.id, updatedCompany.employees, this.jwt());
  }

  getById(id: number) {
    return this.http.get(this.baseUrl+'/api/companies/' + id, this.jwt()).map((response: Response) => response.json());
  }

  delete(id: number) {
    return this.http.delete(this.baseUrl+'/api/companies/' + id, this.jwt());
  }

  getAll() {
    return this.http.get(this.baseUrl+'/api/companies/', this.jwt()).map((response: Response) => response.json());
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

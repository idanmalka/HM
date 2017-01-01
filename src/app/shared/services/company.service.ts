import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Company } from '../../models/company';

@Injectable()
export class CompanyService {
  company : Company ;
  constructor(private http: Http) { }

  create(company: any) {
    //return this.http.post('/api/companies', company, this.jwt()).map((response: Response) => response.json());
    return this.http.post('/api/companies', company, this.jwt()).map((response: Response) =>  response.json());

  }

  update(updatedCompany: Company) {
    let company = JSON.parse(localStorage['currentCompany']);
    Object.assign(company,updatedCompany);
    localStorage.setItem('currentCompany',JSON.stringify(company));
    return this.http.put('/api/companies/'+updatedCompany.id, updatedCompany, this.jwt()).map((response: Response) => response.json());
  }

  getById(id: number) {
    return this.http.get('/api/companies/' + id, this.jwt()).map((response: Response) => response.json());
  }

  // private helper methods

  private jwt() {
    // create authorization header with jwt token
    let currentCompany = JSON.parse(localStorage.getItem('currentCompany'));
    if (currentCompany && currentCompany.token) {
      let headers = new Headers({ 'Authorization': 'Bearer ' + currentCompany.token });
      return new RequestOptions({ headers: headers });
    }
  }

}
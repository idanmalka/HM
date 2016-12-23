import {Visa} from "./visa";
import {User} from "./user";

export class Company{
  id: string;
  name: string;
  address: string;
  field: string;
  visa: Visa;
  employees: User[];

  constructor() {
    this.visa = new Visa();
  }
}

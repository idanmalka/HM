import {Visa} from "./visa";

export class Company{
  id: string;
  name: string;
  address: string;
  field: string;
  visa: Visa;

  constructor() {
    this.visa = new Visa();
  }
}

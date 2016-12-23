import {Company} from "./company";
import {Shift} from "./shift";

export class User {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  isManager: boolean;
  isAdmin: boolean;
  company: Company;
  shifts: Shift[];

  constructor() {
    this.company = new Company();
    this.shifts = [];
  }
}

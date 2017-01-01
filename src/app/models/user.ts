import {Company} from "./company";
import {Shift} from "./shift";

export class User {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email : string;
  phone: string;
  address: string;
  department: string;
  role: string;
  isManager: boolean;
  isAdmin: boolean;
  companyId: number;
  shifts: Shift[];

  constructor() {
    this.shifts = [];
  }
}

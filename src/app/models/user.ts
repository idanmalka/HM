import {Company} from "./company";
import {Shift} from "./shift";

export class User {
  id: number = 0;
  username: string = "";
  password: string = "";
  firstName: string = "";
  lastName: string = "";
  email: string = "";
  phone: string = "";
  address: string = "";
  department: string = "";
  role: string = "";
  isManager: boolean = false;
  isAdmin: boolean = false;
  companyId: number = 0;
  shifts: Shift[] = [];
}

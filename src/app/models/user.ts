import { Company } from "./company";

export class User {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  isManager: boolean;
  isAdmin: boolean;
  company: Company;

  constructor() {
    this.company = new Company();
  }
}

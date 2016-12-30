import { Component, OnInit } from '@angular/core';

import { AlertService } from '../../shared/services/alert.service';
import { UserService } from '../../shared/services/user.service';
import {User} from "../../models/user";
import { AuthenticationService} from "../../shared/services/authentication.service";
@Component({
  selector: 'company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.less']
})

export class CompanyDetailsComponent implements OnInit{
    model: User = new User();
    loading = false;

    constructor(
        private authService: AuthenticationService,
        private userService: UserService,
        private alertService: AlertService) { }

    ngOnInit(): void {
        this.model = this.authService.user;
    }

    update() {
        this.loading = true;
        this.userService.update(this.model)
            .subscribe(
             data => {
              this.alertService.success('Update successful', true);
              this.loading = false;
             },
             error => {
              this.alertService.error(error);
              this.loading = false;
             });
    }
}

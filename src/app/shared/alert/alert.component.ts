import { Component, OnInit } from '@angular/core';
import { AlertService } from '../services/alert.service';
import Timer = NodeJS.Timer;

@Component({
  selector: './alert',
  templateUrl: './alert.component.html'
})

export class AlertComponent implements OnInit{
  message: any;
  timer: Timer;

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.alertService.getMessage().subscribe(
      message =>
      {
        this.message = message;
        if (this.timer)
          clearTimeout(this.timer);
        this.timer = setTimeout( arg => this.message = null, 5000);
      });
  }
}

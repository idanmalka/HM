import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable()
export class GatewayConfig {
  ip: string = environment.gatewayIp;
  port: number = environment.gatewayPort;
}

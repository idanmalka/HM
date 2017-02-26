import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class SaveGuard implements CanDeactivate<any> {

  canDeactivate(component) {
    let canDeactivate = component.confirmNavigation();
    return canDeactivate;
  }

}

import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class SaveGuard implements CanDeactivate<any> {

  canDeactivate(component) {
    let canDeactivate = component.confirmNavigation();
    console.log("from canDeactivate:");
    console.log(canDeactivate);
    return canDeactivate;
  }

}

import { Injectable } from '@angular/core';
import {FrontEndService} from "./frontends/front-end.service";

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  constructor(private readonly frontEndService: FrontEndService) {
  }

  init() {
    return Promise.all([
      this.frontEndService.register('http://localhost:3001/')
    ])
  }
}

export function appInitializeFactory(appInitService: AppInitService) {
  return () => {
    return appInitService.init();
  }
}

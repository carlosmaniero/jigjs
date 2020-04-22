import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class FrontEndService {
  private readonly eventMap: Object;

  constructor(private readonly httpClient: HttpClient) {
    this.eventMap = {};
  }

  register(url: string): Promise<void> {
    return this.httpClient
      .get(`${url}metadata`)
      .pipe(tap((metadataResponse: any) => {
        metadataResponse.eventsProvider.forEach((eventProvider) => {
          eventProvider.events.forEach((event) => {
            this.eventMap[event] = eventProvider.serviceFile;
          });
        })
      }))
      .toPromise();
  }

  getServiceForEvent(event: string) {
    return this.eventMap[event];
  }
}

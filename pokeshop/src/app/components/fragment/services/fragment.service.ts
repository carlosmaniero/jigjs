import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs";
import {map, tap} from "rxjs/operators";
import {FrontEndDIService} from "../../../frontends/front-end-d-i.service";

export interface FetchParams {
  url: string
}

@Injectable({
  providedIn: 'root'
})
export class FragmentService {
  constructor(private readonly httpClient: HttpClient, private readonly frontEndDIService: FrontEndDIService) {
  }

  fetch(param: FetchParams): Observable<string> {
    const requestOptions: Object = {
      headers: new HttpHeaders(),
      responseType: 'text',
      observe: 'response'
    }

    return this.httpClient.get<HttpResponse<string>>(param.url, requestOptions)
      .pipe(
        tap((response) => {
          this.resolveDependencies(response);
        }),
        map((response) => response.body)
      );
  }

  private resolveDependencies(response: HttpResponse<string>) {
    const events = response.headers.get('X-Event-Dependency');

    if (events) {
      events.split(",").forEach(event => {
        this.frontEndDIService.injectDependencyOfEvent(event.trim());
      });
    }
  }
}

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";

export interface FetchParams {
  url: string
}

@Injectable({
  providedIn: 'root'
})
export class FragmentService {

  constructor(private readonly httpClient: HttpClient) {
  }

  fetch(param: FetchParams): Observable<string> {
    const requestOptions: Object = {
      headers: new HttpHeaders(),
      responseType: 'text'
    }

    return this.httpClient.get<string>(param.url, requestOptions).pipe(tap(console.log));
  }
}

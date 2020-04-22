import {TestBed} from '@angular/core/testing';

import {FragmentService} from './fragment.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {HttpHeaders} from "@angular/common/http";
import {FrontEndDIService} from "../../../frontends/front-end-d-i.service";
import createSpy = jasmine.createSpy;

describe('FragmentService', () => {
  let fragmentService: FragmentService;
  let testingController;
  let frontEndDIMock;

  beforeEach(() => {
    frontEndDIMock = createSpy();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {provide: FrontEndDIService, useValue: {injectDependencyOfEvent: frontEndDIMock}}
      ]
    });
    fragmentService = TestBed.inject(FragmentService);
    testingController = TestBed.inject(HttpTestingController);
  });

  it('returns the HTML of the request', async () => {
    const url = 'http://fragment/';
    const response = fragmentService
      .fetch({url})
      .toPromise();

    const responseBody = "<div>Hello, World!</div>";
    testingController.expectOne(url).flush(responseBody);

    expect(await response).toBe(responseBody);

  });

  it('injects the component dependency', async () => {
    const url = 'http://fragment/';
    const response = fragmentService
      .fetch({url})
      .toPromise();

    const responseBody = "<div>Hello, World!</div>";
    testingController.expectOne(url).flush(responseBody, {headers: new HttpHeaders()
        .append("X-Event-Dependency", "MY_EVENT, MY_OTHER_EVENT")});

    await response;

    expect(frontEndDIMock).toHaveBeenCalledWith("MY_EVENT");
    expect(frontEndDIMock).toHaveBeenCalledWith("MY_OTHER_EVENT");
  });
});

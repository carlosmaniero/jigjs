import { TestBed } from '@angular/core/testing';

import { FrontEndService } from './front-end.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

describe('FrontEndServiceService', () => {
  let frontEndService: FrontEndService;
  let httpClientController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    frontEndService = TestBed.inject(FrontEndService);
    httpClientController = TestBed.inject(HttpTestingController);
  });

  it('should register a micro-front-end', async () => {
    const url = 'http://localhost:3001/';

    const registration = frontEndService.register(url);

    const req = httpClientController.expectOne(`${url}metadata`);

    req.flush({
      "eventsProvider": [{
        "events": ["CART_SERVICE_ADD_TO_CART"],
        "serviceFile":"services/service.js"
      }]
    });

    await registration;

    expect(frontEndService.getServiceForEvent('CART_SERVICE_ADD_TO_CART'))
      .toBe(`services/service.js`);
  });
});

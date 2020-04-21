import { TestBed } from '@angular/core/testing';

import { FragmentService } from './fragment.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

describe('FragmentService', () => {
  let fragmentService: FragmentService;
  let testingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
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
});

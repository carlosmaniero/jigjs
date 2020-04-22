import fetchMock from "jest-fetch-mock";
import {FrontEndService} from "./front-end.service";

describe('FrontEndServiceService', () => {
  let frontEndService: FrontEndService;

  beforeAll(() => {
    fetchMock.enableMocks()
  });

  beforeEach(() => {
    frontEndService = new FrontEndService();
    fetchMock.resetMocks()
  })

  afterAll(() => {
    fetchMock.disableMocks();
  })

  it('should register a micro-front-end', async () => {
    const url = 'http://localhost:3001/';

    fetchMock.mockResponseOnce(
        JSON.stringify({
          "eventsProvider": [{
            "events": ["CART_SERVICE_ADD_TO_CART"],
            "serviceFile":"services/service.js"
          }]
        })
    )

    await frontEndService.register(url);


    expect(frontEndService.getServiceForEvent('CART_SERVICE_ADD_TO_CART'))
      .toBe(`services/service.js`);
  });
});

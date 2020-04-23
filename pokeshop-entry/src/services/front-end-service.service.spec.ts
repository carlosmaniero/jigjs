import fetchMock from "jest-fetch-mock";
import {FrontEndMetadata} from "./front-end.metadata";

describe('FrontEndServiceService', () => {
  let frontEndService: FrontEndMetadata;

  beforeAll(() => {
    fetchMock.enableMocks()
  });

  beforeEach(() => {
    frontEndService = new FrontEndMetadata();
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

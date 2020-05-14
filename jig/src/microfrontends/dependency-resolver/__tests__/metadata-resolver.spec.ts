import {MetadataResolver} from "../metadata-resolver";
import fetchMock from "jest-fetch-mock";


describe("Server Metadata Resolver", () => {
    beforeAll(() => {
        fetchMock.enableMocks()
    });

    beforeEach(() => {
        fetchMock.resetMocks()
    })

    afterAll(() => {
        fetchMock.disableMocks();
    });

    it('resolves metadata from server list', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({
            eventsProvider: [
                {
                    events: [
                        "CART_SERVICE_ITEMS",
                        "CART_SERVICE_ADD_TO_CART",
                        "CART_SERVICE_ASK_FOR_ITEMS",
                        "CART_SERVICE_UPDATE_ITEM",
                        "CART_SERVICE_DELETE_ITEM"
                    ],
                    serviceFile: "http://localhost:8989/services/services.js"
                }
            ]
        }));

        const metadataResolver = MetadataResolver
            .of(
                "http://localhost:8989/metadata"
            );

        await metadataResolver.wait();

        expect(metadataResolver.serviceFileForEvent('CART_SERVICE_UPDATE_ITEM'))
            .toBe('http://localhost:8989/services/services.js');
    });

    it('resolves even if any request was rejected', async () => {
        fetchMock
            .mockRejectOnce()
            .mockResponseOnce(JSON.stringify({
            eventsProvider: [
                {
                    events: [
                        "CART_SERVICE_ITEMS",
                        "CART_SERVICE_ADD_TO_CART",
                        "CART_SERVICE_ASK_FOR_ITEMS",
                        "CART_SERVICE_UPDATE_ITEM",
                        "CART_SERVICE_DELETE_ITEM"
                    ],
                    serviceFile: "http://localhost:8989/services/services.js"
                }
            ]
        }));

        const metadataResolver = MetadataResolver
            .of(
                "http://localhost:8989/metadata",
                "http://localhost:8980/metadata"
            );

        await metadataResolver.wait();

        expect(metadataResolver.serviceFileForEvent('CART_SERVICE_UPDATE_ITEM'))
            .toBe('http://localhost:8989/services/services.js');
    });

    it('returns null if the event was not found', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({
            eventsProvider: []
        }));

        const metadataResolver = MetadataResolver
            .of(
                "http://localhost:8989/metadata"
            );

        await metadataResolver.wait();

        expect(metadataResolver.serviceFileForEvent('CART_SERVICE_UPDATE_ITEM'))
            .toBe(null);
    });

    it('returns null if there are no events provider into the response', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({}));

        const metadataResolver = MetadataResolver
            .of(
                "http://localhost:8989/metadata"
            );

        await metadataResolver.wait();

        expect(metadataResolver.serviceFileForEvent('CART_SERVICE_UPDATE_ITEM'))
            .toBe(null);
    });

    it('returns null if there are no events into the events provider', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({
            eventsProvider: [
                {
                    serviceFile: "http://localhost:8989/services/services.js"
                }
            ]
        }));

        const metadataResolver = MetadataResolver
            .of(
                "http://localhost:8989/metadata"
            );

        await metadataResolver.wait();

        expect(metadataResolver.serviceFileForEvent('CART_SERVICE_UPDATE_ITEM'))
            .toBe(null);
    });

    it('returns null if there are no service file into the events provider', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({
            eventsProvider: [
                {
                    serviceFile: "http://localhost:8989/services/services.js"
                }
            ]
        }));

        const metadataResolver = MetadataResolver
            .of(
                "http://localhost:8989/metadata"
            );

        await metadataResolver.wait();

        expect(metadataResolver.serviceFileForEvent('CART_SERVICE_UPDATE_ITEM'))
            .toBe(null);
    });
});

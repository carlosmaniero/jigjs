import fetchMock from "jest-fetch-mock";
import {FragmentResolver, FragmentResolverImpl} from "./fragment-resolver";

describe('FragmentResolver', () => {
    beforeAll(() => {
        fetchMock.enableMocks()
    });

    beforeEach(() => {
        fetchMock.resetMocks()
    })

    afterAll(() => {
        fetchMock.disableMocks();
    });

    it('fetches the html', async () => {
        const fragmentResolver = new FragmentResolverImpl();

        const responseHtml = '<div>Hello, World!</div>';
        fetchMock.mockResponseOnce(responseHtml)

        const response = await fragmentResolver.resolve({
            url: 'http://localhost:1221'
        });
        expect(response.html).toBe(responseHtml);
    });


    it('fetches event dependencies', async () => {
        const fragmentResolver = new FragmentResolverImpl();

        const responseHtml = '<div>Hello, World!</div>';
        fetchMock.mockResponseOnce(responseHtml, {
            headers: {
                'X-Event-Dependency': 'event_dependency'
            }
        })

        const response = await fragmentResolver.resolve({
            url: 'http://localhost:1221',
            headers: { ping: 'pong' }
        });
        expect(response.eventDependencies).toEqual(['event_dependency']);
    });

    it('fetches event dependencies and split it into a list', async () => {
        const fragmentResolver = new FragmentResolverImpl();

        const responseHtml = '<div>Hello, World!</div>';
        fetchMock.mockResponseOnce(responseHtml, {
            headers: {
                'X-Event-Dependency': 'event_dependency1,event_dependency2'
            }
        })

        const response = await fragmentResolver.resolve({
            url: 'http://localhost:1221',
            headers: { ping: 'pong' }
        });
        expect(response.eventDependencies).toEqual(['event_dependency1', 'event_dependency2']);
    });

    it('calls the error hook when the request fails', async () => {
        const onError = jest.fn();
        const fragmentResolver = new FragmentResolverImpl({
            onError: onError
        });

        const error = new Error('Error!');
        fetchMock.mockReject(error)

        const response = await fragmentResolver.resolve({
            url: 'http://localhost:1221',
            headers: { ping: 'pong' }
        });
        expect(onError).toBeCalledWith('http://localhost:1221', error);
    });

    it('calls the fatal hook when the request fails and it was a required request', async () => {
        const onFatal = jest.fn();
        const fragmentResolver = new FragmentResolverImpl({
            onFatal
        });

        const error = new Error('Error!');
        fetchMock.mockReject(error)

        const response = await fragmentResolver.resolve({
            url: 'http://localhost:1221',
            required: true
        });
        expect(onFatal).toBeCalledWith('http://localhost:1221', error);
    });
});

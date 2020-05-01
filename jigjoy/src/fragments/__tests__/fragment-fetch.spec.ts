import '../../core/register';
import fetchMock from 'jest-fetch-mock';
import {FragmentFetch} from "../fragment-fetch";
import {FragmentResolverError} from "../fragments";

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
        const browserFragmentResolver = new FragmentFetch();

        const responseHtml = '<div>Hello, World!</div>';
        fetchMock.mockResponseOnce(responseHtml)

        const response = await browserFragmentResolver.fetch({
            url: 'http://localhost:1221',
        });
        expect(response.html).toBe(responseHtml);
    });


    it('fetches event dependencies', async () => {
        const browserFragmentResolver = new FragmentFetch();

        const responseHtml = '<div>Hello, World!</div>';
        fetchMock.mockResponseOnce(responseHtml, {
            headers: {
                'X-Event-Dependency': 'event_dependency'
            }
        })

        const response = await browserFragmentResolver.fetch({
            url: 'http://localhost:1221',
            headers: {ping: 'pong'}
        });
        expect(response.dependencies).toEqual(['event_dependency']);
    });

    it('fetches event dependencies and split it into a list', async () => {
        const browserFragmentResolver = new FragmentFetch();

        const responseHtml = '<div>Hello, World!</div>';
        fetchMock.mockResponseOnce(responseHtml, {
            headers: {
                'X-Event-Dependency': 'event_dependency1,event_dependency2'
            }
        })

        const response = await browserFragmentResolver.fetch({
            url: 'http://localhost:1221',
            headers: {ping: 'pong'}
        });
        expect(response.dependencies).toEqual(['event_dependency1', 'event_dependency2']);
    });

    it('returns an error given a non 200 status code', async () => {
        const browserFragmentResolver = new FragmentFetch();

        const responseHtml = '<h1>Not Found!</h1>';
        fetchMock.mockResponseOnce(responseHtml, {
            headers: {},
            status: 404
        })

        const options = {
            url: 'http://localhost:1221',
            headers: {ping: 'pong'}
        };

        await expect(browserFragmentResolver.fetch(options)).rejects
            .toThrow(new FragmentResolverError(options, {} as any));
    });

    it('returns an error given a fetch error', async () => {
        const browserFragmentResolver = new FragmentFetch();

        const response = new Error('Internal Server Error!');
        fetchMock.mockReject(response);

        const options = {
            url: 'http://localhost:1221',
            headers: {ping: 'pong'}
        };

        await expect(browserFragmentResolver.fetch(options)).rejects
            .toThrow(new FragmentResolverError(options, response));
    });
});
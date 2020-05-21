import '../../../core/register';
import fetchMock from 'jest-fetch-mock';
import {FragmentFetch} from "../fragment-fetch";
import {FragmentResolverError} from "../fragments";
import {Container} from "../../../core/di";
import {ErrorHandler} from "../../../error/error-handler";
import {waitForPromises} from "../../../testing/wait-for-promises";

describe('FragmentResolver', () => {
    let container;
    let fatalMock;

    beforeAll(() => {
        fetchMock.enableMocks();
    });

    beforeEach(() => {
        fatalMock = jest.fn();
        container = new Container();
        container.register(ErrorHandler, {
            useValue: {
                fatal: fatalMock
            }
        });
        container.register(FragmentFetch, FragmentFetch);
        fetchMock.resetMocks();
    })

    afterAll(() => {
        fetchMock.disableMocks();
    });

    it('fetches the html', async () => {
        const fragmentFetch = container.resolve(FragmentFetch);

        const responseHtml = '<div>Hello, World!</div>';
        fetchMock.mockResponseOnce(responseHtml)

        const response = await fragmentFetch.fetch({
            url: 'http://localhost:1221',
        });
        expect(response.html).toBe(responseHtml);
    });

    it('returns an error given a non 200 status code', async () => {
        const fragmentFetch = container.resolve(FragmentFetch);

        const responseHtml = '<h1>Not Found!</h1>';
        fetchMock.mockResponseOnce(responseHtml, {
            headers: {},
            status: 404,
        })

        const options = {
            url: 'http://localhost:1221',
            headers: {ping: 'pong'},
            required: true
        };

        await expect(fragmentFetch.fetch(options)).rejects
            .toThrow(new FragmentResolverError(options, {} as any));
        expect(fatalMock).toBeCalled();
    });

    it('returns an error given a fetch error', async () => {
        const fragmentFetch = container.resolve(FragmentFetch);

        const response = new Error('Internal Server Error!');
        fetchMock.mockReject(response);

        const options = {
            url: 'http://localhost:1221',
            headers: {ping: 'pong'}
        };

        await expect(fragmentFetch.fetch(options)).rejects
            .toThrow(new FragmentResolverError(options, response));
        expect(fatalMock).not.toBeCalled();
    });

    it('sends fatal response', async () => {
        const fragmentFetch: FragmentFetch = container.resolve(FragmentFetch);

        const response = new Error('Internal Server Error!');
        fetchMock.mockReject(response);

        const options = {
            url: 'http://localhost:1221',
            headers: {ping: 'pong'},
            required: true
        };

        try {
            await fragmentFetch.fetch(options);
        } catch {
        }

        await waitForPromises();
        expect(fatalMock).toBeCalledWith(new FragmentResolverError(options, response));
    });
});

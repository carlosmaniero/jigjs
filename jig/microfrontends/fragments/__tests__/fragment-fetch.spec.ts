import '../../../core/register';
import fetchMock from 'jest-fetch-mock';
import {FragmentFetch} from "../fragment-fetch";
import {FragmentResolverError} from "../fragments";
import {Container} from "../../../core/di";
import {ErrorHandler} from "../../../error/error-handler";
import {waitForPromises} from "../../../testing/wait-for-promises";
import {configureJSDOM, WindowInjectionToken} from "../../../core/dom";

describe('FragmentResolver', () => {
    let container;
    let fatalMock;
    let errorListener;
    let window;

    beforeAll(() => {
        fetchMock.enableMocks();
        jest.useFakeTimers();
    });

    beforeEach(() => {
        fatalMock = jest.fn();
        container = new Container();
        container.register(ErrorHandler, {
            useValue: {
                fatal: fatalMock,
                subscribe: (listener): void => {
                    errorListener = listener
                }
            }
        });
        window = configureJSDOM().window;
        container.register(WindowInjectionToken, {useValue: window});
        container.register(FragmentFetch, FragmentFetch);
        fetchMock.resetMocks();
    })

    afterAll(() => {
        fetchMock.disableMocks();
        jest.useRealTimers();
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

    it('aborts requests when error', async () => {
        const fragmentFetch: FragmentFetch = container.resolve(FragmentFetch);

        const options = {
            url: 'http://localhost:1221',
            headers: {ping: 'pong'},
            required: true
        };

        fetchMock.mockResponse(async () => {
            errorListener(new Error());
            return '';
        });

        await fragmentFetch.fetch(options);

        // Needs improvement!
        // It would be nice to look at the fetch return instead of the mock configuration
        expect((fetch as any).mock.calls[0][1].signal.aborted).toBeTruthy();
    });

    it('aborts requests does not calls the error handler', async () => {
        const fragmentFetch: FragmentFetch = container.resolve(FragmentFetch);

        const options = {
            url: 'http://localhost:1221',
            headers: {ping: 'pong'},
            required: true
        };

        (global as any).DOMException = window.DOMException;
        fetchMock.mockAbort();

        try {
            await fragmentFetch.fetch(options);
        } catch {}

        expect(fatalMock).not.toBeCalled();
    });
});

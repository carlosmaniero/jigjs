import '../../core/register';
import {FragmentResponse} from "../fragments";
import {ServerFragmentResolver} from "../server/server-fragment-resolver";

describe('Server Fragment Resolver', () => {
    it('waits for all fragments to be resolved', async () => {
        let firstRequest: FragmentResponse = null;
        let secondRequest: FragmentResponse = null;

        const fragmentResolverMock = {
            fetch: jest.fn((options) => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            html: `Hello from ${options.url}`
                        });
                    }, 5);
                })
            })
        };

        const serverFragmentResolver = new ServerFragmentResolver(fragmentResolverMock as any);

        serverFragmentResolver.resolve({url: 'http://localhost:3000'})
            .then((response) => firstRequest = response);

        serverFragmentResolver.resolve({url: 'http://localhost:3001'})
            .then((response) => secondRequest = response);

        await serverFragmentResolver.waitForAllBeResolved();

        expect(firstRequest).toEqual({
            html: `Hello from http://localhost:3000`
        });

        expect(secondRequest).toEqual({
            html: `Hello from http://localhost:3001`
        });
    });

    it('waits even if some request returns error', async () => {
        let firstRequest: FragmentResponse = null;
        let secondRequest: FragmentResponse = null;

        const fragmentResolverMock = {
            fetch: jest.fn((options) => {
                if (options.url === 'http://localhost:3000') {
                    return Promise.reject("error!");
                }
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            html: `Hello from ${options.url}`
                        });
                    }, 5);
                })
            })
        };

        const serverFragmentResolver = new ServerFragmentResolver(fragmentResolverMock as any);

        serverFragmentResolver.resolve({url: 'http://localhost:3000'})
            .catch((response) => firstRequest = response);

        serverFragmentResolver.resolve({url: 'http://localhost:3001'})
            .then((response) => secondRequest = response);

        await serverFragmentResolver.waitForAllBeResolved();

        expect(firstRequest).toEqual("error!");

        expect(secondRequest).toEqual({
            html: `Hello from http://localhost:3001`
        });
    });

    it('waits retuns the list of promises with their status', async () => {
        const successResponse = {html: `Hello`};

        const fragmentResolverMock = {
            fetch: jest.fn((options) => {
                if (options.url === 'http://localhost:3000') {
                    return Promise.reject("error!");
                }
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(successResponse);
                    }, 5);
                })
            })
        };

        const serverFragmentResolver = new ServerFragmentResolver(fragmentResolverMock as any);

        serverFragmentResolver.resolve({url: 'http://localhost:3000'});
        serverFragmentResolver.resolve({url: 'http://localhost:3001'});

        const responses = await serverFragmentResolver.waitForAllBeResolved();

        expect(responses).toContainEqual({
            error: 'error!'
        });

        expect(responses).toContainEqual({
            response: successResponse
        });
    });
});

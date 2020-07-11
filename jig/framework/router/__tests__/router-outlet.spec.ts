import {RouterOutlet} from "../router-outlet";
import {configureJSDOM, DOM} from "../../../core/dom";
import {component, html, renderComponent} from "../../../components";
import {waitForPromises} from "../../../testing/wait-for-promises";
import {waitUntil} from "../../../reactive";
import {render} from "../../../template/render";
import {RouterModule} from "../module";
import {Platform} from "../../patform/platform";
import {TransferStateReader} from "../../transfer-state/internals/transfer-state-reader";
import {TransferStateWriter} from "../../transfer-state/internals/transfer-state-writer";
import {TransferState} from "../../transfer-state";

const controlledPromise = () => {
    let resolver;
    let rejecter;

    const promise = new Promise<any>((resolve, reject) => {
        resolver = resolve;
        rejecter = reject;
    });

    return {
        promise, resolver, rejecter
    }
}

describe('Router outlet', () => {
    @component()
    class HelloComponent {
        constructor(private readonly name: string) {
        }

        render() {
            return html`Hello, ${this.name}`
        }
    }

    it('returns nothing given no route matches', async () => {
        const dom = configureJSDOM(undefined, 'http://jig/home')

        const routerModule = new RouterModule(dom.window, Platform.browser());

        routerModule.routes.handle({
            path: '/',
            name: 'home',
            handler(params, render): void {
                render(new HelloComponent('world'));
            }
        });

        renderComponent(dom.body, routerModule.routerOutlet);

        expect(dom.body.querySelector('routeroutlet').innerHTML).toBe('');

        await waitForPromises();

        expect(routerModule.routerOutlet.isResolved()).toBeTruthy();
    });

    it('returns the render result', async () => {
        const dom = configureJSDOM(undefined, 'http://jig/home')

        const routerModule = new RouterModule(dom.window, Platform.server());

        routerModule.routes.handle({
            path: '/home',
            name: 'home',
            handler(params, render): void {
                render(new HelloComponent('world'));
            }
        });

        const routerOutlet = routerModule.routerOutlet;

        renderComponent(dom.body, routerOutlet);

        await waitForPromises();

        expect(dom.body.querySelector('routeroutlet').querySelector('hellocomponent').textContent)
            .toBe('Hello, world');

        await waitForPromises();
        expect(routerOutlet.isResolved()).toBeTruthy();
    });

    it('receives router params', async () => {
        const dom = configureJSDOM(undefined, 'http://jig/hello/world')

        const routerModule = new RouterModule(dom.window, Platform.server());

        routerModule.routes.handle({
            path: '/hello/:name',
            name: 'hello',
            handler(params: { name: string }, render): void {
                render(new HelloComponent(params.name));
            }
        });

        const routerOutlet = routerModule.routerOutlet;

        renderComponent(dom.body, routerOutlet);

        await waitForPromises();

        expect(dom.body.querySelector('routeroutlet').querySelector('hellocomponent').textContent)
            .toBe('Hello, world');
    });

    describe('controlling resolution', () => {
        it('is as not resolved until the handle promise not completed', async () => {
            const dom = configureJSDOM(undefined, 'http://jig/home')
            const promise = controlledPromise();

            const routerModule = new RouterModule(dom.window, Platform.server());

            routerModule.routes.handle({
                path: '/home',
                name: 'home',
                handler(params, render): Promise<void> {
                    render(new HelloComponent('world'));
                    return promise.promise;
                }
            });

            renderComponent(dom.body, routerModule.routerOutlet);

            expect(routerModule.routerOutlet.isResolved()).toBeFalsy();
            promise.resolver();
            await waitForPromises();
            expect(routerModule.routerOutlet.isResolved()).toBeTruthy();
        });

        it('resolution change is observable', async (done) => {
            const dom = configureJSDOM(undefined, 'http://jig/home')
            const promise = controlledPromise();

            const routerModule = new RouterModule(dom.window, Platform.server());

            routerModule.routes.handle({
                path: '/home',
                name: 'home',
                handler(params, render): Promise<void> {
                    render(new HelloComponent('world'));
                    return promise.promise;
                }
            });

            renderComponent(dom.body, routerModule.routerOutlet);

            waitUntil(routerModule.routerOutlet, () => routerModule.routerOutlet.isResolved()).then(done);
            promise.resolver();
        });

        it('stops render process after a route change', async () => {
            const dom = configureJSDOM(undefined, 'http://jig/home')
            const promise = controlledPromise();

            const routerModule = new RouterModule(dom.window, Platform.server());

            routerModule.routes
                .handle({
                    path: '/home',
                    name: 'home',
                    handler(params, render): Promise<void> {
                        return promise.promise.then(() => {
                            render(new HelloComponent('world'));
                        });
                    }
                })
                .handle({
                    path: '/another',
                    name: 'another',
                    handler(params, render): void {
                        render(new HelloComponent('another'));
                    }
                });

            const routerOutlet = routerModule.routerOutlet;

            renderComponent(dom.body, routerOutlet);
            routerModule.history.push('/another');

            await waitForPromises();
            promise.resolver();
            await waitForPromises();

            expect(dom.body.querySelector('routeroutlet').querySelector('hellocomponent').textContent)
                .toBe('Hello, another');
        });
    });

    describe('404', () => {
        it('returns a default 404 page', async () => {
            const dom = configureJSDOM(undefined, 'http://jig/home')

            const routerModule = new RouterModule(dom.window, Platform.server());
            const routerOutlet = routerModule.routerOutlet;

            renderComponent(dom.body, routerOutlet);

            await waitForPromises();
            expect(routerOutlet.isResolved()).toBeTruthy();
            expect(dom.body.textContent).toContain('404 - Not Found');
        });

        it('receives a custom a 404 handler', async () => {
            @component()
            class NotFountPage {
                constructor(private readonly route: string) {
                }

                render() {
                    return html`${this.route} not found.`
                }
            }

            const dom = configureJSDOM(undefined, 'http://jig/home')

            const routerModule = new RouterModule(dom.window, Platform.server());
            const routerOutlet = routerModule.routerOutlet;

            routerModule.routes.handle404((route, render): void => render(new NotFountPage(route)));

            renderComponent(dom.body, routerOutlet);

            await waitForPromises();
            expect(routerOutlet.isResolved()).toBeTruthy();
            expect(dom.body.textContent).toContain('/home not found');
        });
    });

    describe('when state history', () => {
        it('updates with the new route result', async () => {
            const dom = configureJSDOM(undefined, 'http://jig/hello/world')

            const routerModule = new RouterModule(dom.window, Platform.server());
            routerModule.routes.handle({
                path: '/hello/:name',
                name: 'hello',
                handler(params: { name: string }, render): void {
                    render(new HelloComponent(params.name));
                }
            });

            const history = routerModule.history;
            const routerOutlet = routerModule.routerOutlet;

            renderComponent(dom.body, routerOutlet);

            history.push('/hello/universe');

            await waitForPromises();

            expect(dom.body.querySelector('routeroutlet').querySelector('hellocomponent').textContent)
                .toBe('Hello, universe');
        });

        it('does subscribe to history changes before mount', async () => {
            const dom = configureJSDOM(undefined, 'http://jig/hello/world')
            const renderStub = jest.fn();

            const routerModule = new RouterModule(dom.window, Platform.server());
            routerModule.routes.handle({
                path: '/hello/:name',
                name: 'hello',
                handler(params: { name: string }, render): void {
                    renderStub();
                    render(new HelloComponent(params.name));
                }
            });

            const history = routerModule.history;

            history.push('/hello/universe');

            await waitForPromises();

            expect(renderStub).not.toBeCalled();
        });

        it('stops to observe when the router is disconnected', async () => {
            const dom = configureJSDOM(undefined, 'http://jig/hello/world')
            const renderStub = jest.fn();

            const routerModule = new RouterModule(dom.window, Platform.server());
            routerModule.routes.handle({
                path: '/hello/:name',
                name: 'hello',
                handler(params: { name: string }, render): void {
                    renderStub();
                    render(new HelloComponent(params.name));
                }
            });

            const routerOutlet = routerModule.routerOutlet;
            const history = routerModule.history;

            renderComponent(dom.body, routerOutlet);
            render(dom.document.createElement('div'))(dom.body);

            history.push('/hello/universe');

            await waitForPromises();

            expect(renderStub).toBeCalledTimes(1);
        });
    });

    describe('Customising response', () => {
        it('returns 500 status code when handler returns a rejected promise', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => {
                return;
            });

            const dom = configureJSDOM(undefined, 'http://jig/home')
            const promise = controlledPromise();

            const routerModule = new RouterModule(dom.window, Platform.server());

            routerModule.routes.handle({
                path: '/success',
                name: 'success',
                handler(params, render): void {
                    render(new HelloComponent('world'));
                }
            });
            routerModule.routes.handle({
                path: '/home',
                name: 'home',
                handler(params, render): Promise<void> {
                    render(new HelloComponent('resolved with error'));
                    return promise.promise;
                }
            });

            const {routerOutlet, history} = routerModule;

            renderComponent(dom.body, routerOutlet);
            const error = new Error('my error');
            promise.rejecter(error);
            await waitForPromises();
            expect(routerOutlet.latestResponse.statusCode).toBe(500);
            expect(console.error).toBeCalledWith('Router resolved with an error: ', error);
            expect(dom.body.textContent).toContain('resolved with error');

            history.push('/success');
            promise.resolver();

            await waitForPromises();
            expect(routerOutlet.latestResponse.statusCode).toBe(200);
        });

        it('returns a custom status code', async () => {
            const dom = configureJSDOM(undefined, 'http://jig/admin')

            const routerModule = new RouterModule(dom.window, Platform.server());

            routerModule.routes.handle({
                path: '/admin',
                name: 'admin',
                handler(params, render, transferState, response): void {
                    render(new HelloComponent('get out'));
                    response.statusCode = 401;
                }
            });

            const {routerOutlet} = routerModule;

            renderComponent(dom.body, routerOutlet);

            await waitForPromises();
            expect(dom.body.textContent).toContain('get out');
            expect(routerOutlet.latestResponse.statusCode).toBe(401);
        });
    });

    describe('Transfer State', () => {
        describe('server', () => {
            it('returns an empty transfer state with the current route', (done) => {
                const dom = configureJSDOM(undefined, 'http://jigjs.com/');

                const routerModule = new RouterModule(dom.window, Platform.server());
                routerModule.routes.handle({
                    path: '/',
                    name: 'home',
                    handler(params, render, transferState): void {
                        expect(transferState.getState(RouterOutlet.ROUTER_OUTLET_TRANSFER_STATE_URL)).toBe('/');
                        render(new HelloComponent('world'));
                        done();
                    }
                });

                renderComponent(dom.body, routerModule.routerOutlet);
            });

            it('persists the transfer state after the router is handled', async () => {
                const dom = configureJSDOM(undefined, 'http://jigjs.com/');

                const routerModule = new RouterModule(dom.window, Platform.server());

                routerModule.routes.handle({
                    path: '/',
                    name: 'home',
                    handler(params, render, transferState): void {
                        transferState.setState('key', 'value');
                        render(new HelloComponent('world'));
                    }
                });

                renderComponent(dom.body, routerModule.routerOutlet);

                await waitUntil(routerModule.routerOutlet, () => routerModule.routerOutlet.isResolved());

                expect(new TransferStateReader(dom.window).read().getState('key')).toBe('value');
            });


            it('persists the transfer state when the router resolves with an error', async () => {
                jest.spyOn(console, 'error').mockImplementation(() => {
                    return;
                });

                const dom = configureJSDOM(undefined, 'http://jigjs.com/');

                const routerModule = new RouterModule(dom.window, Platform.server());

                routerModule.routes.handle({
                    path: '/',
                    name: 'home',
                    async handler(params, render, transferState): Promise<void> {
                        transferState.setState('key', 'value');
                        render(new HelloComponent('world'));
                        return Promise.reject();
                    }
                });

                renderComponent(dom.body, routerModule.routerOutlet);

                await waitUntil(routerModule.routerOutlet, () => routerModule.routerOutlet.isResolved());

                expect(new TransferStateReader(dom.window).read().getState('key')).toBe('value');
            });
        });
        describe('browser', () => {
            const expectRouterModuleWithEmptyTransferState = (dom: DOM, done: jest.DoneCallback): void => {
                const routerModule = new RouterModule(dom.window, Platform.browser());

                routerModule.routes.handle({
                    path: '/',
                    name: 'home',
                    handler(params, render, transferState): void {
                        expect(transferState.getState(RouterOutlet.ROUTER_OUTLET_TRANSFER_STATE_URL)).toBe('/');
                        expect(Object.keys(transferState.flush())).toHaveLength(1);
                        render(new HelloComponent('world'));
                        done();
                    }
                });

                renderComponent(dom.body, routerModule.routerOutlet);
            }

            it('returns an empty transfer state with the current route given no persisted state', (done) => {
                const dom = configureJSDOM(undefined, 'http://jigjs.com/');

                expectRouterModuleWithEmptyTransferState(dom, done);
            });

            it('returns an empty transfer state with the current route given transfer state router differs from the current route', (done) => {
                const dom = configureJSDOM(undefined, 'http://jigjs.com/');

                new TransferStateWriter(dom.window)
                    .write(new TransferState({
                        key: 'value',
                        [RouterOutlet.ROUTER_OUTLET_TRANSFER_STATE_URL]: '/any-other'
                    }));

                expectRouterModuleWithEmptyTransferState(dom, done);
            });

            it('returns the expected transfer state when current url matches', (done) => {
                const dom = configureJSDOM(undefined, 'http://jigjs.com/');

                new TransferStateWriter(dom.window)
                    .write(new TransferState({
                        key: 'value',
                        [RouterOutlet.ROUTER_OUTLET_TRANSFER_STATE_URL]: '/'
                    }));

                const routerModule = new RouterModule(dom.window, Platform.browser());

                routerModule.routes.handle({
                    path: '/',
                    name: 'home',
                    handler(params, render, transferState): void {
                        expect(transferState.getState(RouterOutlet.ROUTER_OUTLET_TRANSFER_STATE_URL)).toBe('/');
                        expect(transferState.getState('key')).toBe('value');
                        render(new HelloComponent('world'));
                        done();
                    }
                });

                renderComponent(dom.body, routerModule.routerOutlet);
            });
        });
    });
});

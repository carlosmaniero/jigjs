import {RouterOutlet} from "../router-outlet";
import {History} from "../history";
import {configureJSDOM} from "../../core/dom";
import {Routes} from "../routes";
import {html, pureComponent, renderComponent} from "../../pure-components/pure-component";
import {waitForPromises} from "../../testing/wait-for-promises";
import {waitUntil} from "../../reactive";
import {render} from "../../template/render";
import {RouterModule} from "../module";

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
    @pureComponent()
    class HelloComponent {
        constructor(private readonly name: string) {
        }

        render() {
            return html`Hello, ${this.name}`
        }
    }

    it('returns nothing given no route matches', async () => {
        const dom = configureJSDOM(undefined, 'http://jig/home')

        const routerModule = new RouterModule(dom.window, new Routes([
            {
                path: '/',
                name: 'home',
                handler(params, render): void {
                    render(new HelloComponent('world'));
                }
            }
        ]));

        renderComponent(dom.body, routerModule.routerOutlet);

        expect(dom.body.querySelector('routeroutlet').innerHTML).toBe('');

        await waitForPromises();

        expect(routerModule.routerOutlet.isResolved()).toBeTruthy();
    });

    it('returns the render result', async () => {
        const dom = configureJSDOM(undefined, 'http://jig/home')

        const routerOutlet = new RouterOutlet(new History(dom.window), new Routes([
            {
                path: '/home',
                name: 'home',
                handler(params, render): void {
                    render(new HelloComponent('world'));
                }
            }
        ]));

        renderComponent(dom.body, routerOutlet);

        await waitForPromises();

        expect(dom.body.querySelector('routeroutlet').querySelector('hellocomponent').textContent)
            .toBe('Hello, world');

        await waitForPromises();
        expect(routerOutlet.isResolved()).toBeTruthy();
    });

    it('receives router params', async () => {
        const dom = configureJSDOM(undefined, 'http://jig/hello/world')

        const routerOutlet = new RouterOutlet(new History(dom.window), new Routes([
            {
                path: '/hello/:name',
                name: 'hello',
                handler(params: {name: string}, render): void {
                    render(new HelloComponent(params.name));
                }
            }
        ]));

        renderComponent(dom.body, routerOutlet);

        await waitForPromises();

        expect(dom.body.querySelector('routeroutlet').querySelector('hellocomponent').textContent)
            .toBe('Hello, world');
    });

    describe('controlling resolution', () => {
        it('is as not resolved until the handle promise not completed', async () => {
            const dom = configureJSDOM(undefined, 'http://jig/home')
            const promise = controlledPromise();

            const routerOutlet = new RouterOutlet(new History(dom.window), new Routes([
                {
                    path: '/home',
                    name: 'home',
                    handler(params, render): Promise<void> {
                        render(new HelloComponent('world'));
                        return promise.promise;
                    }
                }
            ]));

            renderComponent(dom.body, routerOutlet);

            expect(routerOutlet.isResolved()).toBeFalsy();
            promise.resolver();
            await waitForPromises();
            expect(routerOutlet.isResolved()).toBeTruthy();
        });

        it('resolution change is observable', async (done) => {
            const dom = configureJSDOM(undefined, 'http://jig/home')
            const promise = controlledPromise();

            const routerOutlet = new RouterOutlet(new History(dom.window), new Routes([
                {
                    path: '/home',
                    name: 'home',
                    handler(params, render): Promise<void> {
                        render(new HelloComponent('world'));
                        return promise.promise;
                    }
                }
            ]));

            renderComponent(dom.body, routerOutlet);

            waitUntil(routerOutlet, () => routerOutlet.isResolved()).then(done);
            promise.resolver();
        });

        it('stops render process after a route change', async () => {
            const dom = configureJSDOM(undefined, 'http://jig/home')
            const promise = controlledPromise();

            const history = new History(dom.window);
            const routerOutlet = new RouterOutlet(history, new Routes([
                {
                    path: '/home',
                    name: 'home',
                    handler(params, render): Promise<void> {
                        return promise.promise.then(() => {
                            render(new HelloComponent('world'));
                        });
                    }
                },
                {
                    path: '/another',
                    name: 'another',
                    handler(params, render): void {
                        render(new HelloComponent('another'));
                    }
                }
            ]));

            renderComponent(dom.body, routerOutlet);
            history.push('/another');

            await waitForPromises();
            promise.resolver();
            await waitForPromises();

            expect(dom.body.querySelector('routeroutlet').querySelector('hellocomponent').textContent)
                .toBe('Hello, another');
        });
    });

    describe('when state history', () => {
        it('updates with the new route result', async () => {
            const dom = configureJSDOM(undefined, 'http://jig/hello/world')

            const history = new History(dom.window);
            const routerOutlet = new RouterOutlet(history, new Routes([
                {
                    path: '/hello/:name',
                    name: 'hello',
                    handler(params: {name: string}, render): void {
                        render(new HelloComponent(params.name));
                    }
                }
            ]));

            renderComponent(dom.body, routerOutlet);

            history.push('/hello/universe');

            await waitForPromises();

            expect(dom.body.querySelector('routeroutlet').querySelector('hellocomponent').textContent)
                .toBe('Hello, universe');
        });

        it('does subscribe to history changes before mount', async () => {
            const dom = configureJSDOM(undefined, 'http://jig/hello/world')
            const renderStub = jest.fn();

            const history = new History(dom.window);
            new RouterOutlet(history, new Routes([
                {
                    path: '/hello/:name',
                    name: 'hello',
                    handler(params: {name: string}, render): void {
                        renderStub();
                        render(new HelloComponent(params.name));
                    }
                }
            ]));

            history.push('/hello/universe');

            await waitForPromises();

            expect(renderStub).not.toBeCalled();
        });

        it('stops to observe when the router is disconnected', async () => {
            const dom = configureJSDOM(undefined, 'http://jig/hello/world')
            const renderStub = jest.fn();

            const history = new History(dom.window);
            const routerOutlet = new RouterOutlet(history, new Routes([
                {
                    path: '/hello/:name',
                    name: 'hello',
                    handler(params: {name: string}, render): void {
                        renderStub();
                        render(new HelloComponent(params.name));
                    }
                }
            ]));

            renderComponent(dom.body, routerOutlet);
            render(dom.document.createElement('div'))(dom.body);

            history.push('/hello/universe');

            await waitForPromises();

            expect(renderStub).toBeCalledTimes(1);
        });
    });

    describe('unhandled errors', () => {
        it('marks router outlet with error when handler promise is rejected', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { return; });

            const dom = configureJSDOM(undefined, 'http://jig/home')
            const promise = controlledPromise();

            const history = new History(dom.window);
            const routerOutlet = new RouterOutlet(history, new Routes([
                {
                    path: '/home',
                    name: 'home',
                    handler(params, render): Promise<void> {
                        render(new HelloComponent('world'));
                        return promise.promise;
                    }
                },
                {
                    path: '/success',
                    name: 'success',
                    handler(params, render): void {
                        render(new HelloComponent('world'));
                    }
                }
            ]));

            renderComponent(dom.body, routerOutlet);
            promise.rejecter(new Error('my error'));
            await waitForPromises();
            expect(routerOutlet.isResolvedWithUnhandledError()).toBeTruthy();

            history.push('/success');
            promise.resolver();
            expect(routerOutlet.isResolvedWithUnhandledError()).toBeFalsy();
        });
    });
});

import {Router, RouterHooks, Routes} from "../router";
import {Container} from "../../core/di";
import {configureJSDOM, WindowInjectionToken} from "../../core/dom";
import waitForExpect from "wait-for-expect";

describe('Routing', () => {
    describe('Router', () => {
        it('returns null given no router definition', () => {
            expect(new Routes([]).match('/')).toBe(null);
        });

        it('returns the static values', () => {
            const app1 = jest.fn();
            const app2 = jest.fn();

            const routes = new Routes([
                {
                    route: '/',
                    name: 'index',
                    component: app1 as any
                },
                {
                    route: '/my/cool/route',
                    name: 'cool:route',
                    component: app2 as any
                },
            ]);

            expect(routes.match('/').component).toBe(app1);
            expect(routes.match('/').name).toBe('index');
            expect(routes.match('/my/cool/route').component).toBe(app2);
            expect(routes.match('/my/cool/route').name).toBe('cool:route');
        });

        it('returns params', () => {
            const app1 = jest.fn();
            const app2 = jest.fn();

            const routes = new Routes([
                {
                    route: '/hello/:name',
                    name: 'hello',
                    component: app1 as any
                },
                {
                    route: '/hello/?name=:name',
                    name: 'hello:with:query',
                    component: app2 as any
                }
            ]);

            expect(routes.match('/hello/world').component).toBe(app1);
            expect(routes.match('/hello/world').params).toEqual({
                name: 'world'
            });
            expect(routes.match('/hello/?name=world').component).toBe(app2);
            expect(routes.match('/hello/?name=world').params).toEqual({
                name: 'world'
            });
        });
    });

    describe('Router Handler', () => {
        describe('pushing url', () => {
            it('pushes a new state when ask for route change', () => {
                const container = new Container();
                container.registerInstance(Routes, new Routes([
                    {
                        route: '/',
                        name: 'index',
                        component: undefined
                    },
                    {
                        route: '/hello/:name',
                        name: 'hello',
                        component: undefined
                    }
                ]));

                const dom = configureJSDOM(undefined, 'http://localhost:8080/');

                jest.spyOn(dom.window.history, 'pushState');

                container.registerInstance(WindowInjectionToken, dom.window);
                container.registerInstance(RouterHooks, new RouterHooks());
                container.register(Router, Router);

                const routerHandler: Router = container.resolve(Router);

                routerHandler.goTo('hello', {name: 'world'});

                expect(dom.window.history.pushState).toBeCalledWith({steps: 0}, '', '/hello/world');
            });

            it('interacts with hooks when route change', () => {
                const container = new Container();
                const helloComponentMock = jest.fn();
                const indexComponentMock = jest.fn();
                const dom = configureJSDOM(undefined, 'http://localhost:8080/');
                const routerHooks = new RouterHooks();
                const activateCallback = jest.fn();
                const leaveCallback = jest.fn();

                container.registerInstance(Routes, new Routes([
                    {
                        route: '/',
                        name: 'index',
                        component: indexComponentMock
                    },
                    {
                        route: '/hello/:name',
                        name: 'hello',
                        component: helloComponentMock
                    }
                ]));


                container.registerInstance(WindowInjectionToken, dom.window);
                container.registerInstance(RouterHooks, routerHooks);
                container.register(Router, Router);

                routerHooks.onActivate(activateCallback);
                routerHooks.onLeave(leaveCallback);

                const routerHandler: Router = container.resolve(Router);

                routerHandler.goTo('hello', {name: 'world'});

                expect(activateCallback).toBeCalledWith({
                    "component": helloComponentMock,
                    "name": "hello",
                    "params": {
                        "name": "world"
                    }
                });
                expect(leaveCallback).toBeCalledWith({
                    "component": indexComponentMock,
                    "name": "index",
                    "params": {}
                });
            });

            it('throws exception for invalid urls', () => {
                const container = new Container();
                container.registerInstance(Routes, new Routes([
                    {
                        route: '/',
                        name: 'index',
                        component: undefined
                    },
                    {
                        route: '/hello/:name',
                        name: 'hello',
                        component: undefined
                    }
                ]));

                const dom = configureJSDOM(undefined, 'http://localhost:8080/');

                container.registerInstance(WindowInjectionToken, dom.window);
                container.registerInstance(RouterHooks, new RouterHooks());
                container.register(Router, Router);

                const routerHandler: Router = container.resolve(Router);

                expect(() => routerHandler.goTo('hello')).toThrowError();
                expect(() => routerHandler.goTo('dasd')).toThrowError('There is no route called "dasd"');
            });
        });

        describe('history.go', () => {
            it('listen to a history back', async () => {
                const container = new Container();
                const helloComponentMock = jest.fn();
                const indexComponentMock = jest.fn();
                const dom = configureJSDOM(undefined, 'http://localhost:8080/');
                const routerHooks = new RouterHooks();
                const activateCallback = jest.fn();
                const leaveCallback = jest.fn();

                dom.window.history.pushState(undefined, undefined, '/hello/world');

                container.registerInstance(Routes, new Routes([
                    {
                        route: '/',
                        name: 'index',
                        component: indexComponentMock
                    },
                    {
                        route: '/hello/:name',
                        name: 'hello',
                        component: helloComponentMock
                    }
                ]));

                container.registerInstance(WindowInjectionToken, dom.window);
                container.registerInstance(RouterHooks, routerHooks);
                container.register(Router, Router);

                const routerHandler: Router = container.resolve(Router);
                routerHandler.init();

                routerHooks.onActivate(activateCallback);
                routerHooks.onLeave(leaveCallback);

                dom.window.history.back();

                await waitForExpect(() => {
                    expect(activateCallback).toBeCalledWith({
                        "component": indexComponentMock,
                        "name": "index",
                        "params": {}
                    });
                });

                expect(leaveCallback).toBeCalledWith({
                    "component": helloComponentMock,
                    "name": "hello",
                    "params": {
                        "name": "world"
                    }
                });
            });
        });
    });
});

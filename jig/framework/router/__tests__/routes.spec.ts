import {Routes} from "../routes";
import {TransferState} from "../../transfer-state";

describe('Routes', () => {
    it('returns null given no router definition', () => {
        expect(new Routes([]).handlerFor('/')).toBe(null);
    });

    describe('static routes', () => {
        it('returns matched handler', () => {
            const stubIndex = jest.fn();
            const stubCoolRoute = jest.fn();

            const indexHandler = {
                path: '/',
                name: 'index',
                handler: stubIndex
            };
            const coolRouteHandler = {
                path: '/my/cool/route',
                name: 'cool:route',
                handler: stubCoolRoute
            };

            const routes = new Routes([
                indexHandler,
                coolRouteHandler,
            ]);

            expect(routes.handlerFor('/').routerHandler).toBe(stubIndex);
            expect(routes.handlerFor('/my/cool/route').routerHandler).toBe(stubCoolRoute);
        });

        it('executes the handler with empty params object', () => {
            const stubIndex = jest.fn();

            const indexHandler = {
                path: '/',
                name: 'index',
                handler: stubIndex
            };

            const routes = new Routes([
                indexHandler,
            ]);

            const renderFn = jest.fn();
            const transferState = new TransferState();
            routes.handlerFor('/').resolve(renderFn, transferState);

            expect(stubIndex.mock.calls[0][0]).toEqual({});
        });
    });

    describe('routes with params', () => {
        it('matches parametrized routes', () => {
            const renderFn = jest.fn();

            const app1 = jest.fn();
            const app2 = jest.fn();

            const routes = new Routes([
                {
                    path: '/hello/:name',
                    name: 'hello',
                    handler: app1
                },
                {
                    path: '/hello/?name=:name',
                    name: 'hello:with:query',
                    handler: app2
                }
            ]);

            const transferState = new TransferState();
            routes.handlerFor('/hello/world').resolve(renderFn, transferState);
            routes.handlerFor('/hello/?name=world').resolve(renderFn, transferState);

            expect(app1.mock.calls[0][0]).toEqual({name: 'world'});
            expect(app2.mock.calls[0][0]).toEqual({name: 'world'});
        });
    });

    describe('reversing', () => {
        it('reverses for a name', () => {
            const routes = new Routes([
                {
                    path: '/',
                    name: 'index',
                    handler: jest.fn()
                },
                {
                    path: '/hello/:name',
                    name: 'hello',
                    handler: jest.fn()
                },
                {
                    path: '/hello/?name=:name',
                    name: 'hello:with:query',
                    handler: jest.fn()
                }
            ]);

            expect(routes.reverse('index')).toBe('/');
            expect(routes.reverse('hello', {"name": 'world'})).toBe('/hello/world');
            expect(routes.reverse('hello:with:query', {name: 'world'})).toBe('/hello/?name=world');
        });

        it('throws an exception given no route with the given name', () => {
            const routes = new Routes([
                {
                    path: '/',
                    name: 'index',
                    handler: jest.fn()
                },
                {
                    path: '/',
                    name: 'page',
                    handler: jest.fn()
                }
            ]);

            expect(() => routes.reverse('home'))
                .toThrowError(new Error('There are no route named "home".'));
        });

        it('throws an exception given the router can`t be resolved with the given params', () => {
            const routes = new Routes([
                {
                    path: '/hello/:name',
                    name: 'hello',
                    handler: jest.fn()
                },
            ]);

            expect(() => routes.reverse('hello', {nome: 'world'}))
                .toThrowError(new Error(`It is not possible to revert "/hello/:name" using '{"nome":"world"}'.`));
        });
    });
});

import {Routes} from "../routes";

describe('Router', () => {
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

            expect(routes.handlerFor('/').routerHandler).toBe(indexHandler);
            expect(routes.handlerFor('/my/cool/route').routerHandler).toBe(coolRouteHandler);
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
            routes.handlerFor('/').resolve(renderFn);

            expect(stubIndex).toBeCalledWith({}, renderFn);
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

            routes.handlerFor('/hello/world').resolve(renderFn);
            routes.handlerFor('/hello/?name=world').resolve(renderFn);
        });
    });
});

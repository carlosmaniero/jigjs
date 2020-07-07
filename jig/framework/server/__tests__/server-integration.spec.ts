import {ServerSideRendering} from "../ssr";
import {component, disconnectedCallback, html} from "../../../components";
import {Routes} from "../../router/routes";
import {App, AppFactory} from "../../app/app";
import {RouterModule} from "../../router/module";
import {Server} from "../server";
import {waitForPromises} from "../../../testing/wait-for-promises";
import request from "supertest";


describe('server integration', () => {
    it('renders a component', async () => {
        const appFactory: AppFactory = (window, platform) => {
            @component()
            class Component {
                render() {
                    return html`Hello, World!`;
                }
            }

            const routes = new Routes([{
                path: '/my-route',
                name: 'home',
                handler(params, render, transferState) {
                    render(new Component());
                }
            }]);

            return new App(new RouterModule(window, platform, routes))
        }

        const server = new Server(new ServerSideRendering(appFactory, `<div id="root"></div>`, '#root'));
        server.configure();

        const response = await request(server.app)
            .get('/my-route')
            .expect(200);

        expect(response.text).toContain('Hello, World!');
    });

    it('disconnects components after resolve', async () => {
        const disconnectStub = jest.fn();
        const appFactory: AppFactory = (window, platform) => {
            @component()
            class Component {
                render() {
                    return html`Hello, World!`;
                }

                @disconnectedCallback()
                onDisconnect(): void {
                    disconnectStub();
                }
            }

            const routes = new Routes([{
                path: '/my-route',
                name: 'home',
                handler(params, render) {
                    render(new Component());
                }
            }]);

            return new App(new RouterModule(window, platform, routes))
        }

        const server = new Server(new ServerSideRendering(appFactory, `<div id="root"></div>`, '#root'));
        server.configure();

        await request(server.app)
            .get('/my-route')
            .expect(200);

        expect(disconnectStub).toBeCalled();
    });

    it('renders a async component', async () => {
        const appFactory: AppFactory = (window, platform) => {
            @component()
            class Component {
                render() {
                    return html`Hello, World!`;
                }
            }

            const routes = new Routes([{
                path: '/my-route',
                name: 'home',
                async handler(params, render) {
                    await waitForPromises();
                    render(new Component());
                }
            }]);

            return new App(new RouterModule(window, platform, routes))
        }

        const server = new Server(new ServerSideRendering(appFactory, `<div id="root"></div>`, '#root'));
        server.configure();

        const response = await request(server.app)
            .get('/my-route')
            .expect(200);

        expect(response.text).toContain('Hello, World!');
    });

    it('returns error given an error on fetch', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { return; });
        const appFactory: AppFactory = (window, platform) => {
            const routes = new Routes([{
                path: '/my-route',
                name: 'home',
                handler() {
                    return Promise.reject("bla!");
                }
            }]);

            return new App(new RouterModule(window, platform, routes))
        }

        const server = new Server(new ServerSideRendering(appFactory, `<div id="root"></div>`, '#root'));
        server.configure();

        await request(server.app)
            .get('/my-route')
            .expect(500);
    });

    it('returns a 404 status code when route does not exists', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {
            return;
        });
        const appFactory: AppFactory = (window, platform) => {
            const routes = new Routes([]);

            return new App(new RouterModule(window, platform, routes))
        }

        const server = new Server(new ServerSideRendering(appFactory, `<div id="root"></div>`, '#root'));
        server.configure();

        await request(server.app).get('/my-route').expect(404);
    });

    describe('controls response', () => {
        it('returns a custom status code and headers', async () => {
            @component()
            class Component {
                render() {
                    return html`Get out!`;
                }
            }

            const appFactory: AppFactory = (window, platform) => {
                return new App(new RouterModule(window, platform, new Routes([
                    {
                        path: '/admin',
                        name: 'admin',
                        handler(params, render, transferState, response): void {
                            render(new Component());

                            response.statusCode = 401;
                            response.headers = {
                                'custom-header': 'custom-value'
                            }
                        }
                    }
                ])));
            }

            const server = new Server(new ServerSideRendering(appFactory, `<div id="root"></div>`, '#root'));
            server.configure();

            const response = await request(server.app).get('/admin').expect(401);

            expect(response.headers['custom-header']).toBe('custom-value');
        });
    })
});

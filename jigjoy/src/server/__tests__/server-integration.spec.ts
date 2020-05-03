import '../../core/register'
import "../../fragments/server/server-fragment-module";
import {JigJoyServer} from "../server";
import {JigJoyApp} from "../../core/app";
import {Component, html, RenderResult} from "../../components/component";
import {JigJoyModule} from "../../core/module";
import * as path from "path";
import {RequestWaitMiddleware} from "../middlewares";
import {FragmentFetch} from "../../fragments/fragment-fetch";
import {FragmentComponentFactory} from "../../fragments/fragment-component";
import {DIContainer} from "../../core/di";

const request = require("supertest");

describe('Jig Joy Server', () => {
    it('renders the app', async () => {
        const server = new JigJoyServer({
            port: 4200,
            assetsPath: '/assets/',
            routes: [
                {
                    route: '/my-route',
                    templatePath: path.join(__dirname, 'basic.html'),
                    app: new JigJoyApp({
                        module: new JigJoyModule({}),
                        bootstrap: class extends Component {
                            readonly selector: string = 'my-component';

                            render(): RenderResult {
                                return html`Hello, World!`;
                            }
                        }
                    })
                }
            ]
        });

        const response = await request(server.app)
            .get('/my-route')
            .expect(200);

        expect(response.text).toContain('Hello, World!');
    });

    it('waits until all server RequestWaitMiddleware is done', async () => {
        let firstResolver;
        let secondResolver;
        let responseBody = null;

        const server = new JigJoyServer({
            port: 4200,
            assetsPath: '/assets/',
            routes: [
                {
                    route: '/my-route',
                    templatePath: path.join(__dirname, 'basic.html'),
                    app: new JigJoyApp({
                        module: new JigJoyModule({
                            providers: [
                                {
                                    provide: RequestWaitMiddleware.InjectionToken,
                                    useValue: {
                                        wait: () => new Promise(resolve => firstResolver = resolve)
                                    }
                                },
                                {
                                    provide: RequestWaitMiddleware.InjectionToken,
                                    useValue: {
                                        wait: () => new Promise(resolve => secondResolver = resolve)
                                    }
                                }
                            ]
                        }),
                        bootstrap: class extends Component {
                            readonly selector: string = 'my-component';

                            render(): RenderResult {
                                return html`Hello, World!`;
                            }
                        }
                    })
                }
            ]
        });

        request(server.app)
            .get('/my-route')
            .expect(200)
            .then((response) => responseBody = response.text);

        await new Promise(resolve => setTimeout(() => resolve(), 100));

        expect(responseBody).toBeNull();

        firstResolver();

        await new Promise(resolve => setImmediate(() => resolve()));
        expect(responseBody).toBeNull();

        secondResolver();

        await new Promise(resolve => setImmediate(() => resolve()));
        expect(responseBody).toContain('Hello, World!');
    });

    it('does not shares the same context for different requests', async () => {
        let firstResolver;
        let secondResolver;
        let firstResponseBody = null;
        let secondResponseBody = null;

        const server = new JigJoyServer({
            port: 4200,
            assetsPath: '/assets/',
            routes: [
                {
                    route: '/my-route',
                    templatePath: path.join(__dirname, 'basic.html'),
                    app: new JigJoyApp({
                        module: new JigJoyModule({
                            providers: [
                                {
                                    provide: FragmentFetch,
                                    useValue: {
                                        fetch: () => new Promise(resolve => {
                                            if (!firstResolver)  {
                                                firstResolver = resolve
                                                return;
                                            }
                                            secondResolver = resolve;
                                        })
                                    }
                                },
                            ]
                        }).andThen((container) => {
                            const fragmentComponentFactory = container.resolve(FragmentComponentFactory);

                            return new JigJoyModule({
                                components: [
                                    fragmentComponentFactory.createFragment({
                                        selector: 'first-fragment',
                                        options: {
                                            url: 'http://localhost:8000',
                                        }
                                    })
                                ]
                            })
                        }),
                        bootstrap: class extends Component {
                            readonly selector: string = 'my-component';

                            render(): RenderResult {
                                return document.createElement('first-fragment');
                            }
                        }
                    })
                }
            ]
        });

        request(server.app)
            .get('/my-route')
            .then((response) => {
                if (firstResponseBody) {
                    secondResponseBody = response.text
                    return;
                }
                firstResponseBody = response.text
            });

        request(server.app)
            .get('/my-route')
            .then((response) => {
                if (firstResponseBody) {
                    secondResponseBody = response.text
                    return;
                }
                firstResponseBody = response.text
            });

        await new Promise(resolve => setTimeout(() => resolve(), 1000));

        expect(firstResponseBody).toBeNull();
        expect(secondResponseBody).toBeNull();

        firstResolver({html: "Hello, World!"});

        await new Promise(resolve => setImmediate(() => resolve()));
        expect(firstResponseBody).toContain('Hello, World!');
        expect(secondResponseBody).toBeNull();

        secondResolver({html: "Hello, Universe!"});

        await new Promise(resolve => setImmediate(() => resolve()));

        expect(secondResponseBody).toContain('Hello, Universe!');
    });
})

import {JigServer} from "../server";
import {JigApp} from "../../core/app";
import {JigModule} from "../../core/module";
import * as path from "path";
import {BeforeFlushRequest, RequestWaitMiddleware} from "../middlewares";
import {FragmentFetch} from "../../microfrontends/fragments/fragment-fetch";
import {FragmentComponent} from "../../microfrontends/fragments/fragment-component";
import waitForExpect from "wait-for-expect";
import {Component, html, RenderResult} from "../../components/component";
import {ServerTemplateController, ServerTemplateControllerResolver} from "../controller";
import {serverComponentModule} from "../../components/server/module";
import {serverFragmentModule} from "../../microfrontends/fragments/server/module";
import request from "supertest";
import {Injectable} from "../../core/di";
import {ErrorHandler} from "../../error/error-handler";
import {waitForPromises} from "../../testing/wait-for-promises";

describe('Jig Joy Server', () => {
    @Component('my-component')
    class DefaultBootstrapComponent {
        render(): RenderResult {
            return html`Hello, World!`;
        }
    }

    it('renders the app', async () => {
        const server = new JigServer({
            port: 4200,
            assetsPath: '/assets/',
            routes: [
                {
                    route: '/my-route',
                    templatePath: path.join(__dirname, 'basic.html'),
                    app: new JigApp({
                        bundleName: 'test-app',
                        bootstrap: DefaultBootstrapComponent
                    }).withModule(serverComponentModule())
                }
            ]
        });

        const response = await request(server.app)
            .get('/my-route')
            .expect(200);

        expect(response.text).toContain('Hello, World!');
    });

    it('has a module to override configuration', async () => {
        @Injectable()
        class MyController {
            resolve({res}: ServerTemplateControllerResolver) {
                res.send("Hello, Universe!");
            }
        }

        const server = new JigServer({
            port: 4200,
            assetsPath: '/assets/',
            routes: [
                {
                    route: '/my-route',
                    templatePath: path.join(__dirname, 'basic.html'),
                    app: new JigApp({
                        bundleName: 'test-app',
                        bootstrap: DefaultBootstrapComponent
                    })
                }
            ],
            customProviders: [{
                provide: ServerTemplateController, useClass: MyController
            }]
        });

        const response = await request(server.app)
            .get('/my-route')
            .expect(200);

        expect(response.text).toBe('Hello, Universe!');
    });

    it('calls all BeforeFlushRequest', async () => {
        const firstMock = jest.fn();
        const secondMock = jest.fn();
        const server = new JigServer({
            port: 4200,
            assetsPath: '/assets/',
            routes: [
                {
                    route: '/my-route',
                    templatePath: path.join(__dirname, 'basic.html'),
                    app: new JigApp({
                        bundleName: 'test-app',
                        modules: [
                            new JigModule({
                                providers: [
                                    {
                                        provide: BeforeFlushRequest.InjectionToken,
                                        useValue: {beforeFlushRequest: firstMock}
                                     },
                                    {
                                        provide: BeforeFlushRequest.InjectionToken,
                                        useValue: {beforeFlushRequest: secondMock}
                                    },
                                ]
                            })
                        ],
                        bootstrap: DefaultBootstrapComponent
                    }).withModule(serverComponentModule())
                }
            ]
        });

        const response = await request(server.app)
            .get('/my-route')
            .expect(200);

        expect(firstMock).toBeCalled();
        expect(secondMock).toBeCalled();
    });

    it('waits until all server RequestWaitMiddleware is done', async () => {
        let firstResolver;
        let secondResolver;
        let responseBody = null;

        const server = new JigServer({
            port: 4200,
            assetsPath: '/assets/',
            routes: [
                {
                    route: '/my-route',
                    templatePath: path.join(__dirname, 'basic.html'),
                    app: new JigApp({
                        bundleName: 'test-app',
                        modules: [
                            new JigModule({
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
                            })
                        ],
                        bootstrap: DefaultBootstrapComponent
                    }).withModule(serverComponentModule())
                }
            ]
        });

        request(server.app)
            .get('/my-route')
            .expect(200)
            .then((response) => responseBody = response.text);

        await waitForExpect(() => {
            expect(firstResolver).toBeTruthy();
            expect(secondResolver).toBeTruthy();
        });

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

        @Component('my-component')
        class BootstrapComponent {
            render(): RenderResult {
                return document.createElement('first-fragment');
            }
        }

        @Component('first-fragment')
        class FirstFragment extends FragmentComponent {
            public options = {
                url: 'http://localhost:8000',
            }
        }

        const server = new JigServer({
            port: 4200,
            assetsPath: '/assets/',
            routes: [
                {
                    route: '/my-route',
                    templatePath: path.join(__dirname, 'basic.html'),
                    app: new JigApp({
                        bundleName: 'test-app',
                        bootstrap: BootstrapComponent,
                        components: [FirstFragment]
                    })
                        .withModule(serverComponentModule())
                        .withModule(serverFragmentModule())
                            .registerModuleUsingContainer((container) => {
                                container.unregister(FragmentFetch);
                                return new JigModule({
                                    providers: [
                                        {
                                            provide: FragmentFetch,
                                            useValue: {
                                                fetch: () => new Promise(resolve => {
                                                    if (!firstResolver) {
                                                        firstResolver = resolve
                                                        return;
                                                    }
                                                    secondResolver = resolve;
                                                })
                                            } as any
                                        }
                                    ]
                                });
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

        await waitForExpect(() => {
            expect(firstResolver).toBeTruthy();
            expect(secondResolver).toBeTruthy();
        });

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

    it('finishes the request rendering error when an error happen', async () => {
        let responseBody;
        let errorHandler;

        @Component('my-component')
        class BootstrapComponent {
            render(): RenderResult {
                return document.createElement('first-fragment');
            }
        }

        @Component('first-fragment')
        class FirstFragment extends FragmentComponent {
            public options = {
                url: 'http://localhost:8000',
            }
        }

        const server = new JigServer({
            port: 4200,
            assetsPath: '/assets/',
            routes: [
                {
                    route: '/my-route',
                    templatePath: path.join(__dirname, 'basic.html'),
                    app: new JigApp({
                        bundleName: 'test-app',
                        bootstrap: BootstrapComponent,
                        components: [FirstFragment]
                    })
                        .withModule(serverComponentModule())
                        .withModule(serverFragmentModule())
                        .registerModuleUsingContainer((container) => {
                            container.unregister(FragmentFetch);
                            return new JigModule({
                                providers: [
                                    {
                                        provide: FragmentFetch,
                                        useValue: {
                                            fetch: () => new Promise(() => {
                                                errorHandler = container.resolve(ErrorHandler);
                                                return;
                                            })
                                        } as any
                                    }
                                ]
                            });
                        })
                }
            ]
        });

        request(server.app)
            .get('/my-route')
            .then((response) => {
                responseBody = response.text
            });

        await waitForExpect(() => {
            expect(errorHandler).toBeTruthy();
        });

        errorHandler.fatal(new Error('bla!'));
        await waitForPromises();

        expect(responseBody).toContain('Internal Server Error');
    });
})

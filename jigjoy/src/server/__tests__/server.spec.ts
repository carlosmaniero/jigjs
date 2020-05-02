import '../../core/register'
import {JigJoyServer} from "../server";
import {JigJoyApp} from "../../core/app";
import {Component, html, RenderResult} from "../../components/component";
import {JigJoyModule} from "../../core/module";
import * as path from "path";
import {RequestWaitMiddleware} from "../middlewares";

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
})

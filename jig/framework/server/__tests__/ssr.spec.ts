import {App} from "../../app/app";
import {RouterModule} from "../../router/module";
import {Routes} from "../../router/routes";
import {component, html} from "../../../components";
import {waitForPromises} from "../../../testing/wait-for-promises";
import {Renderable} from "../../../template/render";
import {ServerSideRendering, ServerSideRenderingResponse} from "../ssr";
import {JSDOM} from "jsdom";
import {Platform} from "../../patform/platform";

describe('Server side rendering', () => {
    @component()
    class HomeComponent {
        render(): Renderable {
            return html`Hello, world!`;
        }
    }

    it('renders the given template', async () => {
        const appFactory = (window): App => new App(new RouterModule(window, Platform.server(), new Routes([
            {
                path: '/home',
                name: 'home',
                async handler(params, render): Promise<void> {
                    await waitForPromises();
                    render(new HomeComponent());
                }
            }
        ])));

        const ssr = new ServerSideRendering(appFactory, `
            <html lang="pt-br">
                <head>
                    <title>Hello!</title>                    
                </head>
                <body>
                    <div id="root"></div>
                </body>
            </html>
        `, '#root')

        const renderResult: ServerSideRenderingResponse = await ssr.renderRouteAsString('/home');
        const renderDom = new JSDOM(renderResult.responseText);

        expect(renderResult.statusCode).toBe(200);
        expect(renderDom.window.document.querySelector('html').getAttribute('lang')).toBe('pt-br');
        expect(renderDom.window.document.getElementById('root').querySelector('homecomponent').textContent).toBe('Hello, world!');
    });

    it('returns a server platform', async (done) => {
        const appFactory = (window, platform: Platform): App => {
            expect(platform.isServer()).toBeTruthy();
            done();

            return new App(new RouterModule(window, Platform.server(), new Routes([
                {
                    path: '/home',
                    name: 'home',
                    handler(params, render): void {
                        render(new HomeComponent());
                    }
                }
            ])));
        };

        const ssr = new ServerSideRendering(appFactory, `
            <html lang="pt-br">
                <head>
                    <title>Hello!</title>                    
                </head>
                <body>
                    <div id="root"></div>
                </body>
            </html>
        `, '#root')

        await ssr.renderRouteAsString('/home');
    });
});

import {App} from "../app";
import {RouterModule} from "../../router/module";
import {configureJSDOM} from "../../../core/dom";
import {component, html, renderComponent} from "../../../components";
import {Renderable} from "../../../template/render";
import {waitUntil} from "../../../reactive";
import {Platform} from "../../patform/platform";

describe('App', () => {
    @component()
    class HomeComponent {
        render(): Renderable {
            return html`Hello, world!`;
        }
    }


    describe('controlling initial render', () => {
        it('returns false given router outlet was not rendered', (done) => {
            const dom = configureJSDOM(undefined, 'http://localhost/');

            const routerModule = new RouterModule(dom.window, Platform.browser());

            routerModule.routes.handle({
                path: '/',
                name: 'home',
                handler(params, render): void {
                    render(new HomeComponent());
                }
            })

            const app = new App(routerModule);

            expect(app.isInitialRenderFinished()).toBeFalsy();

            waitUntil(app, () => app.isInitialRenderFinished())
                .then(done);

            renderComponent(dom.body, app);
        });

        it('renders the given route', async () => {
            const dom = configureJSDOM(undefined, 'http://localhost/');

            const routerModule = new RouterModule(dom.window, Platform.browser());

            routerModule.routes.handle({
                path: '/',
                name: 'home',
                handler(params, render): void {
                    render(new HomeComponent());
                }
            });

            const app = new App(routerModule);

            renderComponent(dom.body, app);
            await waitUntil(app, () => app.isInitialRenderFinished())
            expect(dom.body.textContent).toContain('Hello, world!');
        });
    });
});

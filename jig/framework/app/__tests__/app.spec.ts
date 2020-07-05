import {App} from "../app";
import {RouterModule} from "../../router/module";
import {configureJSDOM} from "../../../core/dom";
import {Routes} from "../../router/routes";
import {component, html, renderComponent} from "../../../components";
import {Renderable} from "../../../template/render";
import {waitUntil} from "../../../reactive";

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
            const app = new App(new RouterModule(dom.window, new Routes([
                {
                    path: '/',
                    name: 'home',
                    handler(params, render) {
                        render(new HomeComponent());
                    }
                }
            ])));

            expect(app.isInitialRenderFinished()).toBeFalsy();

            waitUntil(app, () => app.isInitialRenderFinished())
                .then(done);

            renderComponent(dom.body, app);
        });

        it('renders the given route', async () => {
            const dom = configureJSDOM(undefined, 'http://localhost/');
            const app = new App(new RouterModule(dom.window, new Routes([
                {
                    path: '/',
                    name: 'home',
                    handler(params, render) {
                        render(new HomeComponent());
                    }
                }
            ])));

            renderComponent(dom.body, app);
            await waitUntil(app, () => app.isInitialRenderFinished())
            expect(dom.body.textContent).toContain('Hello, world!');
        });
    });
});

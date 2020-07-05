import {App} from "../app";
import {RouterModule} from "../../pure-router/module";
import {configureJSDOM} from "../../core/dom";
import {Routes} from "../../pure-router/routes";
import {html, pureComponent, renderComponent} from "../../pure-components/pure-component";
import {Renderable} from "../../template/render";
import {waitUntil} from "../../reactive";

describe('App', () => {
    @pureComponent()
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

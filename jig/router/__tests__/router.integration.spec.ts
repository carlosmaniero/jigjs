import {Routes} from "../router";
import {configureJSDOM, DocumentInjectionToken, WindowInjectionToken} from "../../core/dom";
import {JigApp} from "../../core/app";
import {Component, Prop} from "../../components/component";
import {html, Renderable} from "../../template/render";
import {Container} from "../../core/di";
import {serverComponentModule} from "../../components/server/module";
import {Platform} from "../../core/platform";
import {RouterOutlet} from "../router-outlet";
import {waitForPromises} from "../../testing/wait-for-promises";
import {routerModule} from "../module";

describe('Routing Integration Tests', () => {
    describe('RouterHandler', () => {
        it('returns activate an app', async () => {
            @Component('hello-world')
            class HelloWorldComponent {
                @Prop()
                private readonly name;

                @Prop()
                private readonly lastName;

                @Prop()
                private readonly age;

                render(): Renderable {
                    return html`Hello ${this.lastName}, ${this.name} (${this.age})`
                }
            }

            const dom = configureJSDOM(undefined, 'http://localhost/hello/socrates/?lastName=sampaio&age=57');

            const routes = new Routes([{
                route: '/hello/:name/?lastName=:lastName&age=:age',
                name: 'hello',
                component: HelloWorldComponent
            }]);

            const container = new Container();
            container.registerInstance(DocumentInjectionToken, dom.document);
            container.registerInstance(WindowInjectionToken, dom.window);
            container.registerInstance(Platform, Platform.browser());

            await new JigApp({
                bootstrap: RouterOutlet,
                bundleName: 'my-bundle-name',
                components: [
                    HelloWorldComponent
                ],
                modules: [
                    serverComponentModule(),
                    routerModule(routes)
                ]
            }).registerCustomElementClass(dom.window as any, container);

            dom.body.innerHTML = '<jig-app></jig-app>';

            await waitForPromises();

            expect(dom.serialize()).toContain('Hello sampaio, socrates (57)');
        });
    });
});

import '../register';
import {JigApp} from "../app";
import {globalContainer} from "../di";
import {ServerRehydrateService} from "../../components/server/server-rehydrate-service";
import {Component, RehydrateService, RenderResult} from "../../components/component";
import {html} from "../../template/render";
import {Platform} from "../platform";
import {configureJSDOM} from "../dom";
import {waitForPromises} from "../../testing/wait-for-promises";


describe('JigEntryPoint', () => {

    it('renders the given EntryPoint', async () => {
        @Component('my-test-component')
        class TestComponent {
            render(): RenderResult {
                return html`hell yeah!`;
            }
        }

        globalContainer.register(Platform, {useValue: new Platform(false)});
        globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const entryPoint = new JigApp({
            bundleName: 'test-app',
            bootstrap: TestComponent,
        });

        const jsdom = configureJSDOM();

        await entryPoint.registerCustomElementClass(jsdom.window as any);

        jsdom.window.document.body.innerHTML = `<jig-app></jig-app>`

        expect(jsdom.serialize()).toContain('hell yeah!');
    });

    it('adds the bundle file at the application head', async () => {
        @Component('my-test-component')
        class TestComponent {
            render(): RenderResult {
                return html`hell yeah!`;
            }
        }

        globalContainer.register(Platform, {useValue: new Platform(false)});
        globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const entryPoint = new JigApp({
            bundleName: 'test-app',
            bootstrap: TestComponent,
        });

        const jsdom = configureJSDOM();

        await entryPoint.registerCustomElementClass(jsdom.window as any);

        jsdom.window.document.body.innerHTML = `<jig-app></jig-app>`;

        await waitForPromises();

        expect(jsdom.window.document.head.querySelector('script').src).toBe('/test-app.app.js');
    });

    it('does not adds the bundle file at head if it exists', async () => {
        @Component('my-test-component')
        class TestComponent {
            render(): RenderResult {
                return html`hell yeah!`;
            }
        }

        globalContainer.register(Platform, {useValue: new Platform(false)});
        globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const entryPoint = new JigApp({
            bundleName: 'test-app',
            bootstrap: TestComponent,
        });

        const jsdom = configureJSDOM();

        jsdom.window.document.head.innerHTML = `<script src="/test-app.app.js"></script>`;
        await entryPoint.registerCustomElementClass(jsdom.window as any);

        expect(jsdom.window.document.head.querySelectorAll('script[src="/test-app.app.js"]'))
            .toHaveLength(1);
    });

    it('does not adds the bundle file if it is browser platform', async () => {
        @Component('my-test-component')
        class TestComponent {
            render(): RenderResult {
                return html`hell yeah!`;
            }
        }

        globalContainer.register(Platform, {useValue: new Platform(true)});
        globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const entryPoint = new JigApp({
            bundleName: 'test-app',
            bootstrap: TestComponent,
        });

        const jsdom = configureJSDOM();

        await entryPoint.registerCustomElementClass(jsdom.window as any);

        expect(jsdom.window.document.head.querySelectorAll('script[src="/test-app.app.js"]'))
            .toHaveLength(0);
    });
});

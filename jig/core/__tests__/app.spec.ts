import '../register';
import {JigApp} from "../app";
import {Container, globalContainer} from "../di";
import {ServerRehydrateService} from "../../components/server/server-rehydrate-service";
import {Component, RehydrateService, RenderResult} from "../../components/component";
import {html} from "../../template/render";
import {Platform} from "../platform";
import {configureJSDOM, DocumentInjectionToken} from "../dom";
import {waitForPromises} from "../../testing/wait-for-promises";
import {ErrorHandler, ErrorHandlerComponentClassInjectionToken} from "../../error/error-handler";
import {DefaultErrorHandlerComponent} from "../../error/default-error-handler-component";


describe('JigEntryPoint', () => {
    @Component('my-test-component')
    class TestComponent {
        render(): RenderResult {
            return html`hell yeah!`;
        }
    }

    it('renders the given EntryPoint', async () => {
        const jsdom = configureJSDOM();

        globalContainer.register(Platform, {useValue: new Platform(false)});
        globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
        globalContainer.registerInstance(DocumentInjectionToken, jsdom.document);

        const entryPoint = new JigApp({
            bundleName: 'test-app',
            bootstrap: TestComponent,
        });

        await entryPoint.registerCustomElementClass(jsdom.window as any);

        jsdom.window.document.body.innerHTML = `<jig-app></jig-app>`;

        await waitForPromises();

        expect(jsdom.serialize()).toContain('hell yeah!');
    });

    it('adds the bundle file at the application head', async () => {
        const jsdom = configureJSDOM();

        globalContainer.registerInstance(DocumentInjectionToken, jsdom.document);
        globalContainer.register(Platform, {useValue: new Platform(false)});
        globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const entryPoint = new JigApp({
            bundleName: 'test-app',
            bootstrap: TestComponent,
        });

        await entryPoint.registerCustomElementClass(jsdom.window as any);

        jsdom.window.document.body.innerHTML = `<jig-app></jig-app>`;

        await waitForPromises();

        expect(jsdom.window.document.head.querySelector('script').src).toBe('/test-app.app.js');
    });

    it('does not adds the bundle file at head if it exists', async () => {
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

    it('Injects default error handler by default', async () => {
        @Component('my-test-component')
        class TestComponent {
            render(): RenderResult {
                return html`hell yeah!`;
            }
        }

        const entryPoint = new JigApp({
            bundleName: 'test-app',
            bootstrap: TestComponent,
        });

        const jsdom = configureJSDOM();

        const container = new Container();
        container.register(Platform, {useValue: new Platform(false)});
        container.register(RehydrateService.InjectionToken, ServerRehydrateService);
        await entryPoint.registerCustomElementClass(jsdom.window as any, container);

        expect(container.isRegistered(ErrorHandler)).toBeTruthy();
        expect(container.isRegistered(DefaultErrorHandlerComponent)).toBeTruthy();
        expect(container.resolve(ErrorHandlerComponentClassInjectionToken)).toBe(DefaultErrorHandlerComponent);
    });

    it('Injects the selected ', async () => {
        @Component('my-error-component')
        class MyErrorComponent {
            render(): RenderResult {
                return html`hell yeah!`;
            }
        }

        const entryPoint = new JigApp({
            bundleName: 'test-app',
            bootstrap: TestComponent,
            errorHandlerComponent: MyErrorComponent
        });

        const jsdom = configureJSDOM();

        const container = new Container();
        container.register(Platform, {useValue: new Platform(false)});
        container.register(RehydrateService.InjectionToken, ServerRehydrateService);
        await entryPoint.registerCustomElementClass(jsdom.window as any, container);

        expect(container.isRegistered(MyErrorComponent)).toBeTruthy();
        expect(container.resolve(ErrorHandlerComponentClassInjectionToken)).toBe(MyErrorComponent);
    });
});

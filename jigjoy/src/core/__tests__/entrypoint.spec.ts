import '../register';
import {JigJoyApp} from "../app";
import {globalContainer} from "../di";
import {ServerRehydrateService} from "../../components/server/server-rehydrate-service";
import {Component, RehydrateService, RenderResult} from "../../components/component";
import {html} from "../../template/render";
import {Platform} from "../platform";
import {configureJSDOM} from "../dom";


describe('JigJoyEntryPoint', () => {

    it('renders the given EntryPoint', () => {
        @Component('my-test-component')
        class TestComponent {
            render(): RenderResult {
                return html`hell yeah!`;
            }
        }

        globalContainer.register(TestComponent, TestComponent);
        globalContainer.register(Platform, {useValue: new Platform(false)});
        globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const entryPoint = new JigJoyApp({
            bootstrap: TestComponent,
        });

        const jsdom = configureJSDOM();

        entryPoint.registerCustomElementClass(jsdom.window as any);

        jsdom.window.document.body.innerHTML = `<jig-joy></jig-joy>`

        expect(jsdom.serialize()).toContain('hell yeah!');
    })
})

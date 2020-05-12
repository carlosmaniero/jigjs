import '../register';
import {JigJoyApp} from "../app";
import {DIContainer} from "../di";
import {JSDOM} from "jsdom";
import {ServerRehydrateService} from "../../components/server/server-rehydrate-service";
import {Component, RehydrateService, RenderResult} from "../../components/component";
import {html} from "../../template/render";
import {Platform} from "../platform";


describe('JigJoyEntryPoint', () => {

    it('renders the given EntryPoint', () => {
        @Component('my-test-component')
        class TestComponent {
            render(): RenderResult {
                return html`hell yeah!`;
            }
        }

        DIContainer.register(Platform, {useValue: new Platform(false)});
        DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const entryPoint = new JigJoyApp({
            bootstrap: TestComponent,
        });

        const jsdom = new JSDOM();

        entryPoint.registerCustomElementClass(jsdom.window as any);

        jsdom.window.document.body.innerHTML = `<jig-joy></jig-joy>`

        expect(jsdom.serialize()).toContain('hell yeah!');
    })
})

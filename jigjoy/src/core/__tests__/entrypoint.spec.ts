import '../register';
import {JigJoyApp} from "../app";
import {DIContainer} from "../di";
import {JSDOM} from "jsdom";
import {ServerRehydrateService} from "../../components/server/server-rehydrate-service";
import {ComponentAnnotation, RehydrateService, RenderResult} from "../../components/component";
import {html} from "../../template/render";


describe('JigJoyEntryPoint', () => {

    it('renders the given EntryPoint', () => {
        @ComponentAnnotation('my-test-component')
        class TestComponent {
            render(): RenderResult {
                return html`hell yeah!`;
            }
        }

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

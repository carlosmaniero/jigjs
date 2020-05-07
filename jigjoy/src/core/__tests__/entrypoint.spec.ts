import '../register';
import {JigJoyApp} from "../app";
import {DIContainer, Injectable} from "../di";
import {html} from "lighterhtml";
import {JSDOM} from "jsdom";
import {Component, RehydrateService, RenderResult} from "../../components/component";
import {ServerRehydrateService} from "../../components/server/server-rehydrate-service";


describe('JigJoyEntryPoint', () => {

    it('renders the given EntryPoint', () => {
        @Injectable()
        class TestComponent extends Component {
            selector: string = "my-test-component";

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

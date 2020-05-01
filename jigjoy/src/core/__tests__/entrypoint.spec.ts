import '../register';
import {JigJoyApp} from "../app";
import {Injectable} from "../di";
import {html} from "lighterhtml";
import {JSDOM} from "jsdom";
import {Component, RenderResult} from "../../components/component";
import {JigJoyModule} from "../module";


describe('JigJoyEntryPoint', () => {

    it('renders the given EntryPoint', () => {
        @Injectable()
        class TestComponent extends Component {
            selector: string = "my-test-component";

            render(): RenderResult {
                return html`hell yeah!`;
            }

        }

        const entryPoint = new JigJoyApp({
            bootstrap: TestComponent,
            module: new JigJoyModule({})
        });

        const jsdom = new JSDOM();

        entryPoint.registerCustomElementClass(jsdom.window);

        jsdom.window.document.body.innerHTML = `<jig-joy></jig-joy>`

        expect(jsdom.serialize()).toContain('hell yeah!');
    })
})

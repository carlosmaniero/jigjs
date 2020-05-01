import '../register';
import {JigJoyEntryPoint} from "../entrypoint";
import {Injectable} from "../di";
import {html} from "lighterhtml";
import {JSDOM} from "jsdom";
import {Component, RenderResult} from "../../components/component";


describe('JigJoyEntryPoint', () => {

    it('renders the given EntryPoint', () => {
        @Injectable()
        class TestComponent extends Component {
            selector: string = "my-test-component";

            render(): RenderResult {
                return html`hell yeah!`;
            }

        }

        const entryPoint = new JigJoyEntryPoint({
            entryPoint: TestComponent,
            components: []
        });

        const jsdom = new JSDOM();

        entryPoint.registerCustomElementClass(jsdom.window);

        jsdom.window.document.body.innerHTML = `<jig-joy></jig-joy>`

        expect(jsdom.serialize()).toContain('hell yeah!');
    })
})

import '../../../jigjoy/src/core/register';
import {Component, html, RenderResult} from "../../../jigjoy/src/components/component";
import {JigJoyEntryPoint} from "../../../jigjoy/src/core/entrypoint";

class Bla extends Component {
    selector: string = "bla-component";
    number = 0;

    render(): RenderResult {
        return html`<jigjoy-fragment-component url="http://127.0.0.1:3001"></jigjoy-fragment-component>`;
    }

    mount() {
        this.number++;
        this.updateRender();
    }
}

new JigJoyEntryPoint({
    entryPoint: Bla,
    components: []
}).registerCustomElementClass(window);

window.onload = () => {
    document.getElementById('app').innerHTML = '<jig-joy></jig-joy>';
}

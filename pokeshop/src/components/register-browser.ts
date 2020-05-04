import '../../../jigjoy/src/core/register';
import {Component, html, RenderResult} from "../../../jigjoy/src/components/component";
import {JigJoyApp} from "../../../jigjoy/src/core/app";
import {JigJoyModule} from "../../../jigjoy/src/core/module";
import "../../../jigjoy/src/fragments/browser/browser-fragment-module";
import {FragmentComponentFactory} from "../../../jigjoy/src/fragments/fragment-component";

class AppComponent extends Component {
    selector: string = "bla-component";
    number = 0;

    render(): RenderResult {
        return html`<cart-count-fragment></cart-count-fragment>`;
    }

    mount() {
        this.number++;
        this.updateRender();
    }
}

new JigJoyApp({
    bootstrap: AppComponent,
    module: new JigJoyModule({
        modules: []
    }).andThen((container) => {
        const fragmentFactory: FragmentComponentFactory = container.resolve(FragmentComponentFactory);

        return new JigJoyModule({
            components: [
                fragmentFactory.createFragment({
                    selector: 'cart-count-fragment',
                    options: {
                        url: 'http://127.0.0.1:3001'
                    },
                    onErrorRender: (error) => html`Error :(`
                })
            ]
        })
    })
}).registerCustomElementClass(window);

window.onload = () => {
    document.getElementById('app').innerHTML = '<jig-joy></jig-joy>';
}

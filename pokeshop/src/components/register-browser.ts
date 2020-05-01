import '../../../jigjoy/src/core/register';
import {Component, html, RenderResult} from "../../../jigjoy/src/components/component";
import {JigJoyApp} from "../../../jigjoy/src/core/app";
import {JigJoyModule} from "../../../jigjoy/src/core/module";
import {browserFragmentModule} from "../../../jigjoy/src/fragments/browser-fragment-module";
import {FragmentComponentFactory} from "../../../jigjoy/src/fragments/fragment-component";

class Bla extends Component {
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
    bootstrap: Bla,
    module: new JigJoyModule({
        modules: [
            browserFragmentModule.andThen((container) => {
                const fragmentFactory: FragmentComponentFactory = container.resolve(FragmentComponentFactory);

                return new JigJoyModule({
                    components: [
                        fragmentFactory.createFragment({
                            options: {
                                url: 'http://127.0.0.1:3001'
                            },
                            selector: 'cart-count-fragment'
                        })
                    ]
                })
            }),
        ]
    })
}).registerCustomElementClass(window);

window.onload = () => {
    document.getElementById('app').innerHTML = '<jig-joy></jig-joy>';
}

import {Component, html, RehydrateService, RenderResult} from "../../../jigjoy/src/components/component";
import {JigJoyApp} from "../../../jigjoy/src/core/app";
import {FragmentComponentFactory} from "../../../jigjoy/src/fragments/fragment-component";
import {JigJoyModule} from "../../../jigjoy/src/core/module";
import {Inject, Injectable} from "../../../jigjoy/src/core/di";

@Injectable()
export class Index extends Component {
    selector: string = "index-component";

    render(): RenderResult {
        return html`<cart-count-fragment></cart-count-fragment>`;
    }
}

export const app = new JigJoyApp({bootstrap: Index})
    .registerModuleUsingContainer((container) => {
        const fragmentFactory: FragmentComponentFactory = container.resolve(FragmentComponentFactory);

        return new JigJoyModule({
            components: [
                fragmentFactory.createFragment({
                    selector: 'cart-count-fragment',
                    options: {
                        url: 'http://127.0.0.1:3001'
                    },
                    onErrorRender: () => html`Error :(`
                })
            ]
        })
    });

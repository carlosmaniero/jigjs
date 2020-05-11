import {JigJoyApp} from "../../../jigjoy/src/core/app";
import {FragmentComponentFactory} from "../../../jigjoy/src/fragments/fragment-component";
import {JigJoyModule} from "../../../jigjoy/src/core/module";
import {ComponentAnnotation, html, OnRehydrate, RenderResult, State} from "../../../jigjoy/src/components/component";

@ComponentAnnotation('index-component')
export class Index implements OnRehydrate {
    @State()
    private clicks = {
        number: 0
    };

    render(): RenderResult {
        return html`
            <cart-count-fragment></cart-count-fragment>
            
            <button onclick="${() => { this.clicks.number++ }}">+</button>
            ${this.clicks.number}
            <button onclick="${() => { this.clicks.number-- }}">-</button>
        `;
    }

    rehydrate(): void {
        this.clicks.number = 0;
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

import {JigApp} from "../../../jig/src/core/app";
import {FragmentComponentFactory} from "../../../jig/src/microfrontends/fragments/fragment-component";
import {JigModule} from "../../../jig/src/core/module";
import {Component, html, OnRehydrate, RenderResult, State} from "../../../jig/src/components/component";

@Component('index-component')
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

export const app = new JigApp({
    bootstrap: Index,
    modules: [new JigModule({
        providers: [
            {provide: FragmentComponentFactory, useClass: FragmentComponentFactory}
        ]
    })]
})
    .registerModuleUsingContainer((container) => {
        const fragmentFactory: FragmentComponentFactory = container.resolve(FragmentComponentFactory);

        return new JigModule({
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

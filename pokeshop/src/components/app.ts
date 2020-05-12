import {JigJoyApp} from "../../../jigjoy/src/core/app";
import {FragmentComponentFactory} from "../../../jigjoy/src/fragments/fragment-component";
import {JigJoyModule} from "../../../jigjoy/src/core/module";
import {Component, html, OnRehydrate, RenderResult, State} from "../../../jigjoy/src/components/component";
import {Platform} from "../../../jigjoy/src/core/platform";

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

export const app = new JigJoyApp({
    bootstrap: Index,
    module: new JigJoyModule({
        providers: [
            {provide: Platform, useValue: Platform.browser()},
            {provide: FragmentComponentFactory, useClass: FragmentComponentFactory}
        ]
    })
})
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

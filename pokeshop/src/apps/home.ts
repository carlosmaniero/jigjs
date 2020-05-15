import '../../../jig/src/core/register';
import {JigApp} from "../../../jig/src/core/app";
import {FragmentComponent} from "../../../jig/src/microfrontends/fragments/fragment-component";
import {Component, html, OnRehydrate, RenderResult, State} from "../../../jig/src/components/component";
import {FragmentOptions} from "../../../jig/src/microfrontends/fragments/fragments";

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

@Component('cart-count-fragment')
class CartCountFragment extends FragmentComponent {
    readonly options: FragmentOptions = {
        url: 'http://127.0.0.1:3001'
    }
}

export default new JigApp({
    bootstrap: Index,
    components: [CartCountFragment],
});

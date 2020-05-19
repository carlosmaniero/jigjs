import 'jigjs/core/register';
import {JigApp} from "jigjs/core/app";
import {FragmentComponent} from "jigjs/microfrontends/fragments/fragment-component";
import {Component, html, OnRehydrate, Prop, RenderResult, State} from "jigjs/components/component";
import {FragmentOptions} from "jigjs/microfrontends/fragments/fragments";
import {Inject, Optional} from 'jigjs/core/di';
import {Request} from "jigjs/router/router";

@Component('index-component')
export class Index implements OnRehydrate {
    @State()
    private state = {
        number: 0,
        page: '1',
    };

    constructor(@Inject(Request.InjectionToken) @Optional() private readonly request: Request) {
    }

    mount() {
        if (this.request && this.request.params.page) {
            this.state.page = this.request.params.page
        }
    }

    render(): RenderResult {
        return html`     
            <cart-count-fragment></cart-count-fragment>
            <catalog-fragment @page="${1}"></catalog-fragment>
        `;
    }

    rehydrate(): void {
        this.state.number = 0;
    }
}

@Component('cart-count-fragment')
class CartCountFragment extends FragmentComponent {
    readonly options: FragmentOptions = {
        url: 'http://127.0.0.1:3001/cart'
    }
}

@Component('catalog-fragment')
class CatalogFragment extends FragmentComponent {
    @Prop()
    private readonly page;

    get options() {
        return {
            url: `http://localhost:3000/catalog/page/${this.page}`
        }
    }

    protected onErrorRender(error: Error): RenderResult {
        return html`Ooops`;
    }
}

export default new JigApp({
    bundleName: 'home',
    bootstrap: Index,
    components: [CartCountFragment, CatalogFragment],
});

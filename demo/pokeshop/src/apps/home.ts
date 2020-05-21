import 'jigjs/core/register';
import {JigApp} from "jigjs/core/app";
import {FragmentComponent} from "jigjs/microfrontends/fragments/fragment-component";
import {Component, html, Prop, RenderResult, State} from "jigjs/components/component";
import {FragmentOptions} from "jigjs/microfrontends/fragments/fragments";
import {Inject, Optional} from 'jigjs/core/di';
import {Request, Response} from "jigjs/router/router";
import {Renderable} from "jigjs/template/render";
import {DocumentInjectionToken} from "jigjs/core/dom";

@Component('index-component')
export class Index {
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
            <catalog-fragment @page="${this.state.page}"></catalog-fragment>
        `;
    }
}

@Component('cart-count-fragment')
class CartCountFragment extends FragmentComponent {
    readonly options: FragmentOptions = {
        url: 'http://127.0.0.1:3001/cart'
    }
}

@Component('error-handler')
class ErrorHandler {
    constructor(
        @Inject(DocumentInjectionToken) private readonly document,
        @Inject(Response.InjectionToken) @Optional() private readonly response?: Response
    ) {
    }

    render(): Renderable {
        return html`
            <iframe src="https://giphy.com/embed/Pok6284jGzyGA" 
                width="480"
                height="273" 
                frameBorder="0" 
                allowFullScreen>    
            </iframe>`
    }

    mount() {
        this.document.title = 'Pokeshop | Internal Server Error :('
        if (this.response) {
            this.response.status(500);
        }
    }
}

@Component('catalog-fragment')
class CatalogFragment extends FragmentComponent {
    @Prop()
    private readonly page;

    get options() {
        return {
            url: `http://localhost:3000/catalog/page/${this.page}`,
            required: true
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
    errorHandlerComponent: ErrorHandler
});

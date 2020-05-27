import 'jigjs/core/register';
import {JigApp} from "jigjs/core/app";
import {FragmentComponent} from "jigjs/microfrontends/fragments/fragment-component";
import {Component, html, Prop, RenderResult, State} from "jigjs/components/component";
import {FragmentOptions} from "jigjs/microfrontends/fragments/fragments";
import {Inject, Optional} from 'jigjs/core/di';
import {Response, Routes} from "jigjs/router/router";
import {Renderable} from "jigjs/template/render";
import {DocumentInjectionToken} from "jigjs/core/dom";
import {RouterOutlet} from "jigjs/router/router-outlet";
import {routerModule} from "jigjs/router/module";
import {RouterLink} from "jigjs/router/router-link";

@Component('simple-test')
class SimpleTest {
    @Prop()
    private readonly x;

    render() {
        return html`HI ${this.x}`;
    }
}

@Component('index-component')
export class Index {
    @State()
    private state = {
        number: 0,
        page: '1',
    };

    @Prop()
    private page: string | null;

    mount() {
        this.state.page = this.page || '1';
    }

    propsChanged() {
        this.state.page = this.page || '1';
    }

    render(): RenderResult {
        const nextPage = (this.page ? parseInt(this.page) : 1) + 1;
        return html`
            ${this.page} ${this.state.page}
            ${this.renderCatalog()}
            <router-link name="catalog:page" @params="${{page: nextPage}}" @children="${[html`Next!`]}"></router-link>
        `;
    }

    private renderCatalog() {
        return [html`<cart-count-fragment></cart-count-fragment><catalog-fragment @page="${this.state.page}"></catalog-fragment>`];
    }
}

@Component('cart-count-fragment')
class CartCountFragment extends FragmentComponent {
    readonly options: FragmentOptions = {
        url: 'http://127.0.0.1:3001/cart',
        async: true
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
            required: true,
            async: false
        }
    }

    unmount() {
        if (typeof (window as any).webpackJsonp !== "undefined") {
            const currentWindow = window as any;
            (currentWindow as any).webpackJsonp = [];
            currentWindow.webpackJsonp = null;
            currentWindow.__BUILD_MANIFEST = null;
            currentWindow.__BUILD_MANIFEST_CB = null;
            currentWindow.__NEXT_DATA__ = null;
            currentWindow.__NEXT_P = null;
            currentWindow.__SSG_MANIFEST = null;
            currentWindow.__SSG_MANIFEST_CB = null;
        }
    }

    protected onErrorRender(error: Error): RenderResult {
        return html`Ooops`;
    }
}

export default new JigApp({
    bundleName: 'home',
    bootstrap: RouterOutlet,
    components: [
        CartCountFragment,
        CatalogFragment,
        Index,
        RouterLink
    ],
    modules: [
        routerModule(new Routes([
            {
                name: 'index',
                component: Index,
                route: '/'
            },
            {
                name: 'catalog:page',
                component: Index,
                route: '/page/:page'
            },
        ]))
    ],
    errorHandlerComponent: ErrorHandler
});

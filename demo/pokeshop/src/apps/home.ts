import 'jigjs/core/register';
import {JigApp} from "jigjs/core/app";
import {Fragment} from "jigjs/microfrontends/fragments/fragment-component";
import {Component, Prop, RenderResult, State} from "jigjs/components/component";
import {FragmentOptions} from "jigjs/microfrontends/fragments/fragments";
import {Inject, Optional} from 'jigjs/core/di';
import {Response, Routes} from "jigjs/router/router";
import {Renderable} from "jigjs/template/render";
import {DocumentInjectionToken} from "jigjs/core/dom";
import {RouterOutlet} from "jigjs/router/router-outlet";
import {routerModule} from "jigjs/router/module";
import {RouterLink} from "jigjs/router/router-link";
import {connectedCallback, html, pureComponent, renderComponent} from "jigjs/pure-components/pure-component";
import {Subject} from "jigjs/events/subject";
import {sideEffect, subscribeToSideEffects} from "jigjs/side-effect/side-effect";


@sideEffect()
class TestClass {
    count = 0

    increase() {
        this.count++;
    }
}

@pureComponent()
class ActionButton {
    clickSubject: Subject<void>;

    constructor(private readonly label: string) {
        this.clickSubject = new Subject();
    }

    render() {
        return html`<button onclick="${() => this.clickSubject.publish()}">${this.label}</button>`
    }
}

@pureComponent()
class ToggleWatchButton {
    private readonly pause = new ActionButton('pause');
    private readonly resume = new ActionButton('resume');

    public readonly pauseSubject: Subject<void>;
    public readonly resumeSubject: Subject<void>;
    public running = true;

    constructor() {
        this.pause = new ActionButton('pause');
        this.resume = new ActionButton('resume');

        this.pauseSubject = this.pause.clickSubject;
        this.resumeSubject = this.resume.clickSubject;

        this.pauseSubject.subscribe(() => {
            this.running = false;
        });

        this.resumeSubject.subscribe(() => {
            this.running = true;
        });
    }

    render() {
        if (this.running) {
            return html`${this.pause}`;
        }

        return html`${this.resume}`;
    }
}

@pureComponent()
class CountWatch {
    private counter = 0;

    private readonly toggleWatchButton = new ToggleWatchButton();
    private readonly restartButton = new ActionButton('restart');

    private interval: any;

    @connectedCallback()
    init() {
        this.startWatcher();

        this.toggleWatchButton.pauseSubject.subscribe(() => {
            this.pauseWatcher();
        });

        this.toggleWatchButton.resumeSubject.subscribe(() => {
            this.startWatcher();
        });

        this.restartButton.clickSubject.subscribe(() => {
            console.log('restarting', this);
            this.restartWatcher();
        });
    }

    private pauseWatcher() {
        clearInterval(this.interval);
    }

    private startWatcher() {
        this.interval = setInterval(() => {
            console.log('upcount', this);
            this.counter++;
        }, 1000);
    }

    render() {
        console.log('rendering');
        return html`
            ${this.restartButton}
            total: ${this.counter}
            ${this.toggleWatchButton}
        `;

    }

    private restartWatcher() {
        this.pauseWatcher();
        this.counter = 0;
        this.startWatcher();
    }
}

@pureComponent()
class PureComponentTest {
    private countWatch = new CountWatch();

    render() {
        return html`It works! ${this.countWatch}`
    }
}

@Component('simple-test')
class SimpleTest {
    @Prop()
    private readonly x;

    render() {
        const div = document.createElement('div');
        setTimeout(() => {
            renderComponent(div, new PureComponentTest());
        }, 200);
        return div;
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
            <simple-test></simple-test>
        `;
    }

    private renderCatalog() {
        return [html`<cart-count-fragment></cart-count-fragment><catalog-fragment @page="${this.state.page}"></catalog-fragment>`];
    }
}

@Fragment('cart-count-fragment')
class CartCountFragment {
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

@Fragment('catalog-fragment')
class CatalogFragment {
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
        RouterLink,
        SimpleTest
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

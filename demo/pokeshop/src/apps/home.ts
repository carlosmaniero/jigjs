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
import {disconnectedCallback, html, pureComponent, renderComponent} from "jigjs/pure-components/pure-component";
import {Subject} from "jigjs/events/subject";
import {observable, observing} from "jigjs/side-effect/observable";


@observable()
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

    @observing()
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

    markAsRunning() {
        this.running = true;
    }
}

@pureComponent()
class Counter {
    @observing()
    private number = 0;
    private interval: any;

    constructor() {
        this.startWatcher();
    }

    render(): Renderable {
        return html`<strong>total:</strong> ${this.number}`;
    }

    public restartWatcher() {
        this.number = 0;
        this.resumeWatcher();
    }

    @disconnectedCallback()
    public pauseWatcher() {
        this.interval = clearInterval(this.interval);
    }

    public resumeWatcher() {
        if (this.interval) {
            return;
        }
        this.startWatcher();
    }

    private startWatcher() {
        this.interval = setInterval(() => {
            this.number++;
        }, 1000);
    }
}

@pureComponent()
class CountWatch {
    private readonly toggleWatchButton = new ToggleWatchButton();
    private readonly restartButton = new ActionButton('restart');
    private readonly counterComponent = new Counter();

    constructor() {
        this.toggleWatchButton.pauseSubject.subscribe(() => {
            this.counterComponent.pauseWatcher();
        });

        this.toggleWatchButton.resumeSubject.subscribe(() => {
            this.counterComponent.resumeWatcher();
        });

        this.restartButton.clickSubject.subscribe(() => {
            this.restartWatcher();
        });
    }

    render() {
        return html`
            ${this.restartButton}
            ${this.counterComponent}
            ${this.toggleWatchButton}
        `;
    }

    @disconnectedCallback()
    public x() {
        console.log('asds');
    }

    private restartWatcher() {
        this.counterComponent.restartWatcher();
        this.toggleWatchButton.markAsRunning();
    }
}

@pureComponent()
class PureComponentTest {
    @observing()
    private countWatchers = [];
    @observing()
    private input = "";

    render() {
        return html`
            <ul>${
                this.countWatchers.map((watcher) => {
                    return html`<li>${watcher}</li>`
                })
            }</ul>
            
            ${this.input}
            
            <input value="${this.input}" oninput="${(event) => {
                this.input = event.target.value;    
            }}">
            
            <button onclick="${() => {
                this.countWatchers = [...this.countWatchers, new CountWatch()]    
            }}">Add Watcher</button>
            
            <button onclick="${() => {
            this.countWatchers = []
        }}">Clean All</button>
        `
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

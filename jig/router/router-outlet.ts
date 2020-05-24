import {Component, lazyLoadComponent, State} from "../components/component";
import {Renderable} from "../template/render";
import {MatchResult, Router, RouterHooks} from "../router/router";
import {Inject} from "../core/di";
import {DocumentInjectionToken} from "../core/dom";

interface RouterOutletState {
    result: MatchResult | null;
}

@Component('router-outlet')
export class RouterOutlet {
    @State()
    state: RouterOutletState = {
        result: null
    }

    constructor(
        private readonly routerHooks: RouterHooks,
        private readonly router: Router,
        @Inject(DocumentInjectionToken) private readonly document
    ) {
    }

    render(): Renderable {
        if (!this.state.result) {
            return;
        }
        return lazyLoadComponent(document, this.state.result.component, this.state.result.params);
    }

    mount(): void {
        this.start();
    }

    rehydrate(): void {
        this.state = {
            result: null
        }

        this.start();
    }

    private start(): void {
        this.routerHooks.onActivate((matcher) => {
            this.state.result = matcher;
        });
        this.router.init();
    }
}

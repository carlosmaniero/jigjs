import {MatchedRouterHandler, Routes} from "./routes";
import {History} from "./history";
import {
    connectedCallback,
    disconnectedCallback,
    html,
    pureComponent,
    RenderableComponent
} from "../pure-components/pure-component";
import {Renderable} from "../template/render";
import {observe, observing} from "../side-effect/observable";
import {Subscription} from "../events/subject";

@pureComponent()
export class RouterOutlet {
    @observing()
    private routeComponent: RenderableComponent;

    @observing()
    private hasUnhandledError = false;

    @observing()
    private resolved = true;
    private currentProcess = 0;
    private historySubscription: Subscription;

    constructor(private readonly history: History, private readonly routes: Routes) {
    }

    render(): Renderable {
        return html`${this.routeComponent}`
    }

    isResolved(): boolean {
        return this.resolved;
    }

    isResolvedWithUnhandledError(): boolean {
        return this.hasUnhandledError;
    }

    @connectedCallback()
    private watchHistory(): void {
        this.historySubscription = observe(this.history, () => {
            this.processRouteHandlingForCurrentUrl();
        });
    }

    @connectedCallback()
    private processRouteHandlingForCurrentUrl(): void {
        this.hasUnhandledError = false;
        const process = this.startProcess();
        const handlerFor = this.routes.handlerFor(this.history.getCurrentUrl());

        if (!handlerFor) {
            return
        }

        this.controlRouteChange(handlerFor, process)
            .catch((e) => {
                console.error(e);
                this.resolved = true;
                this.hasUnhandledError = true;
            });
    }

    @disconnectedCallback()
    private stopWatchingHistory(): void {
        this.historySubscription.unsubscribe();
    }

    private startProcess(): number {
        return ++this.currentProcess % 100;
    }

    private async controlRouteChange(handlerFor: MatchedRouterHandler<object>, process: number): Promise<void> {
        this.resolved = false;

        await handlerFor.resolve((component) => {
            if (this.currentProcess === process) {
                this.routeComponent = component;
            }
        });
        this.resolved = true;
    }
}

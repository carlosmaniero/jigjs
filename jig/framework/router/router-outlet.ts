import {MatchedRouterHandler, Routes} from "./routes";
import {History} from "./history";
import {component, connectedCallback, disconnectedCallback, html, RenderableComponent} from "../../components";
import {Renderable} from "../../template/render";
import {observe, observing} from "../../reactive";
import {Subscription} from "../../events/subject";
import {TransferState} from "../transfer-state";
import {TransferStateWriter} from "../transfer-state/internals/transfer-state-writer";
import {Platform} from "../patform/platform";
import {TransferStateReader} from "../transfer-state/internals/transfer-state-reader";

@component()
export class RouterOutlet {
    static ROUTER_OUTLET_TRANSFER_STATE_URL = '__jigjs__transfer_state_url__';

    @observing()
    private routeComponent: RenderableComponent;

    @observing()
    private hasUnhandledError = false;

    @observing()
    private resolved = true;
    private currentProcess = 0;
    private historySubscription: Subscription;

    constructor(
        private readonly history: History,
        private readonly platform: Platform,
        private readonly transferStateWriter: TransferStateWriter,
        private readonly transferStateReader: TransferStateReader,
        private readonly routes: Routes
    ) {
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

        const transferState = this.createTransferState();

        await handlerFor.resolve((component) => {
            if (this.currentProcess === process) {
                this.routeComponent = component;
            }
        }, transferState);

        this.transferStateWriter.write(transferState);

        this.resolved = true;
    }

    private createTransferState(): TransferState {
        return this.platform.strategy(() => this.browserTransferState(), () => this.emptyTransferState());
    }

    private browserTransferState() {
        if (!this.transferStateReader.hasTransferState()) {
            return this.emptyTransferState();
        }

        const transferState = this.transferStateReader.read();

        if (transferState.getState(RouterOutlet.ROUTER_OUTLET_TRANSFER_STATE_URL) !== this.history.getCurrentUrl()) {
            return this.emptyTransferState();
        }

        return transferState;
    }

    private emptyTransferState(): TransferState {
        const transferState = new TransferState();
        transferState.setState(RouterOutlet.ROUTER_OUTLET_TRANSFER_STATE_URL, this.history.getCurrentUrl());
        return transferState;
    }
}

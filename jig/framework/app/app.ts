import {RouterModule} from "../router/module";
import {component, connectedCallback, html} from "../../components";
import {Renderable} from "../../template/render";
import {propagate} from "../../reactive";

@component()
export class App {
    @propagate()
    private readonly routerModule: RouterModule;
    private connected = false;

    constructor(routerModule: RouterModule) {
        this.routerModule = routerModule;
    }

    render(): Renderable {
        return html`${this.routerModule.routerOutlet}`
    }

    @connectedCallback()
    private setAsConnected(): void {
        this.connected = true;
    }

    isInitialRenderFinished(): boolean {
        return this.connected && this.routerModule.routerOutlet.isResolved();
    }

    isFinishedWithError(): boolean {
        return this.routerModule.routerOutlet.isResolvedWithUnhandledError();
    }
}

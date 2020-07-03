import {History} from "./history";
import {JigWindow} from "../types";
import {RouterOutlet} from "./router-outlet";
import {Routes} from "./routes";
import {observable, propagate} from "../side-effect/observable";

@observable()
export class RouterModule {
    @propagate()
    readonly history: History;
    @propagate()
    readonly routerOutlet: RouterOutlet;

    constructor(private readonly window: JigWindow, routes: Routes) {
        this.history = new History(window);
        this.routerOutlet = new RouterOutlet(this.history, routes);
    }
}

import {History} from "./history";
import {JigWindow} from "../types";
import {RouterOutlet} from "./router-outlet";
import {Routes} from "./routes";
import {observable, propagate} from "../side-effect/observable";
import {RouterLinkFactory} from "./router-link";
import {Navigation} from "./navigation";

@observable()
export class RouterModule {
    @propagate()
    readonly history: History;
    @propagate()
    readonly routerOutlet: RouterOutlet;
    readonly linkFactory: RouterLinkFactory;
    readonly navigation: Navigation;

    constructor(private readonly window: JigWindow, routes: Routes) {
        this.history = new History(window);
        this.routerOutlet = new RouterOutlet(this.history, routes);
        this.navigation = new Navigation(routes, this.history);
        this.linkFactory = new RouterLinkFactory(this.navigation, routes);
    }
}

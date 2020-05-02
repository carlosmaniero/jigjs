import {Component} from "../components/component";
import InjectionToken from "tsyringe/dist/typings/providers/injection-token";
import {DIContainer} from "./di";
import {JigJoyModule} from "./module";

export interface EntryPointOptions {
    bootstrap: typeof Component,
    module: JigJoyModule
}


export class JigJoyApp extends Component {
    readonly selector: string;
    private bootstrap: Component;

    constructor(private readonly options: Readonly<EntryPointOptions>) {
        super();
        this.selector = "jig-joy"
        this.bootstrap = DIContainer.resolve(options.bootstrap as InjectionToken<Component>)
    }

    render() {
        return document.createElement(this.bootstrap.selector);
    }

    registerCustomElementClass(window: any) {
        this.bootstrap.registerCustomElementClass(window);
        this.options.module.register(window);
        super.registerCustomElementClass(window);
    }
}

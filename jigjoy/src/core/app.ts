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
    }

    render() {
        return document.createElement(this.bootstrap.selector);
    }

    registerCustomElementClass(myWindow: any, container = DIContainer) {
        this.bootstrap = container.resolve(this.options.bootstrap as InjectionToken<Component>)
        this.bootstrap.registerCustomElementClass(myWindow);
        this.options.module.register(myWindow, container);
        super.registerCustomElementClass(myWindow);
    }
}

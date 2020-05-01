import {Component} from "../components/component";
import {container} from "tsyringe";
import InjectionToken from "tsyringe/dist/typings/providers/injection-token";
import {FragmentResolver} from "../fragments/fragments";
import {BrowserFragmentResolver} from "../fragments/browser-fragment-resolver";

export interface EntryPointOptions {
    entryPoint: typeof Component,
    components: Component[]
}


export class JigJoyEntryPoint extends Component {
    selector: string;
    private entrypoint: Component;

    constructor(private readonly options: Readonly<EntryPointOptions>) {
        super();
        this.selector = "jig-joy"

        container.register("FragmentResolver", BrowserFragmentResolver);

        this.entrypoint = container.resolve(options.entryPoint as InjectionToken<Component>)
    }

    render() {
        return document.createElement(this.entrypoint.selector);
    }

    registerCustomElementClass(window: any) {
        this.entrypoint.registerCustomElementClass(window);
        super.registerCustomElementClass(window);
    }
}

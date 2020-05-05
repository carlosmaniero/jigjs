import {Component, JigJoyWindow} from "../components/component";
import InjectionToken from "tsyringe/dist/typings/providers/injection-token";
import {DIContainer} from "./di";
import {JigJoyModule} from "./module";

export interface EntryPointOptions {
    bootstrap: new() => Component<unknown>,
    module?: JigJoyModule
}


export class JigJoyApp extends Component {
    readonly selector: string;
    private bootstrap: Component;
    private readonly moduleRegisters: ((container: DIContainer) => JigJoyModule)[] = [];

    constructor(private readonly options: Readonly<EntryPointOptions>) {
        super();
        this.selector = "jig-joy"
    }

    render() {
        return document.createElement(this.bootstrap.selector);
    }

    registerModuleUsingContainer(moduleRegister: (container: DIContainer) => JigJoyModule) {
        this.moduleRegisters.push(moduleRegister);
        return this;
    }

    registerCustomElementClass(window: JigJoyWindow, container = DIContainer) {
        this.bootstrap = container.resolve(this.options.bootstrap as InjectionToken<Component>)
        this.bootstrap.registerCustomElementClass(window);
        this.options.module?.register(window, container);

        this.moduleRegisters.forEach((moduleRegister) => {
            moduleRegister(container).register(window, container);
        });

        super.registerCustomElementClass(window);
    }
}

import {Component, JigJoyWindow, RehydrateService} from "../components/component";
import InjectionToken from "tsyringe/dist/typings/providers/injection-token";
import {DIContainer, Inject} from "./di";
import {JigJoyModule} from "./module";

export interface EntryPointOptions {
    bootstrap: new(...args: unknown[]) => Component<unknown>,
    module?: JigJoyModule
}

export class JigJoyComponent extends Component {
    readonly selector: string;

    constructor(private readonly bootstrap: Component<unknown>) {
        super();
        this.selector = "jig-joy"
    }

    render() {
        return document.createElement(this.bootstrap.selector);
    }
}

export class JigJoyApp {
    private readonly moduleRegisters: ((container: DIContainer) => JigJoyModule)[] = [];

    constructor(private readonly options: Readonly<EntryPointOptions>) {
    }

    registerModuleUsingContainer(moduleRegister: (container: DIContainer) => JigJoyModule) {
        this.moduleRegisters.push(moduleRegister);
        return this;
    }

    registerCustomElementClass(window: JigJoyWindow, container = DIContainer) {
        this.options.module?.register(window, container);
        this.moduleRegisters.forEach((moduleRegister) => {
            moduleRegister(container).register(window, container);
        });

        const bootstrap = container.resolve(this.options.bootstrap as InjectionToken<Component>)
        const rehydrateService: RehydrateService = container.resolve(RehydrateService.InjectionToken);

        bootstrap.registerCustomElementClass(window, rehydrateService);

        new JigJoyComponent(bootstrap)
            .registerCustomElementClass(window, rehydrateService);
    }
}

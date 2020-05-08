import {JigJoyWindow} from "../components/component";
import {DIContainer, Inject} from "./di";
import {JigJoyModule} from "./module";
import {ComponentAnnotation, componentFactoryFor} from "../components/annotation";

export interface EntryPointOptions {
    bootstrap: new(...args: unknown[]) => any,
    module?: JigJoyModule
}

const BootstrapInjectionToken = 'JigJoyBootstrap';

@ComponentAnnotation('jig-joy')
export class JigJoyComponent {
    constructor(@Inject(BootstrapInjectionToken) private readonly bootstrap: any) {}

    render() {
        return document.createElement(this.bootstrap);
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

        const bootstrapFactory = componentFactoryFor(this.options.bootstrap);
        bootstrapFactory.registerComponent(window, container);
        container.register(BootstrapInjectionToken, {useValue: bootstrapFactory.componentSelector});

        componentFactoryFor(JigJoyComponent).registerComponent(window, container);
    }
}

import {Container, globalContainer, Inject} from "./di";
import {JigJoyModule} from "./module";
import {Component, componentFactoryFor, JigJoyWindow} from "../components/component";

export interface EntryPointOptions {
    bootstrap: new(...args: unknown[]) => any,
    module?: JigJoyModule
}

const BootstrapInjectionToken = 'JigJoyBootstrap';

@Component('jig-joy')
export class JigJoyComponent {
    constructor(@Inject(BootstrapInjectionToken) private readonly bootstrap: any) {}

    render() {
        return document.createElement(this.bootstrap);
    }
}

export class JigJoyApp {
    private readonly moduleRegisters: ((container: Container) => JigJoyModule)[] = [];

    constructor(private readonly options: Readonly<EntryPointOptions>) {
    }

    registerModuleUsingContainer(moduleRegister: (container: Container) => JigJoyModule) {
        this.moduleRegisters.push(moduleRegister);
        return this;
    }

    registerCustomElementClass(window: JigJoyWindow, container = globalContainer) {
        container.register(JigJoyComponent, JigJoyComponent);
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

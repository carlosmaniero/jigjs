import {Container, globalContainer, Inject} from "./di";
import {JigJoyModule, ModuleProvider} from "./module";
import {Component, componentFactoryFor, JigJoyWindow} from "../components/component";

export interface EntryPointOptions {
    bootstrap: new(...args: unknown[]) => any,
    modules?: JigJoyModule[]
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
    private modules: JigJoyModule[];

    constructor(private readonly options: Readonly<EntryPointOptions>) {
        this.modules = options.modules || [];
    }

    registerModuleUsingContainer(moduleRegister: (container: Container) => JigJoyModule) {
        this.moduleRegisters.push(moduleRegister);
        return this;
    }

    withModule(module: JigJoyModule) {
        this.modules = [...this.modules, module];
        return this;
    }

    registerCustomElementClass(window: JigJoyWindow, container = globalContainer) {
        this.modules.forEach((module) => {
            module.register(window, container);
        });

        this.moduleRegisters.forEach((moduleRegister) => {
            moduleRegister(container).register(window, container);
        });

        container.register(this.options.bootstrap, this.options.bootstrap);
        const bootstrapFactory = componentFactoryFor(this.options.bootstrap);
        bootstrapFactory.registerComponent(window, container);
        container.register(BootstrapInjectionToken, {useValue: bootstrapFactory.componentSelector});

        container.register(JigJoyComponent, JigJoyComponent);
        componentFactoryFor(JigJoyComponent).registerComponent(window, container);
    }
}

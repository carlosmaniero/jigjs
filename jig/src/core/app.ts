import {Container, globalContainer, Inject} from "./di";
import {JigModule} from "./module";
import {Component, componentFactoryFor, JigWindow} from "../components/component";

export interface EntryPointOptions {
    bootstrap: new(...args: unknown[]) => any,
    modules?: JigModule[]
}

const BootstrapInjectionToken = 'JigBootstrap';

@Component('jig-app')
export class JigAppComponent {
    constructor(@Inject(BootstrapInjectionToken) private readonly bootstrap: any) {}

    render() {
        return document.createElement(this.bootstrap);
    }
}

export class JigApp {
    private readonly moduleRegisters: ((container: Container) => JigModule)[] = [];
    private modules: JigModule[];

    constructor(private readonly options: Readonly<EntryPointOptions>) {
        this.modules = options.modules || [];
    }

    registerModuleUsingContainer(moduleRegister: (container: Container) => JigModule) {
        this.moduleRegisters.push(moduleRegister);
        return this;
    }

    withModule(module: JigModule) {
        this.modules = [...this.modules, module];
        return this;
    }

    registerCustomElementClass(window: JigWindow, container = globalContainer) {
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

        container.register(JigAppComponent, JigAppComponent);
        componentFactoryFor(JigAppComponent).registerComponent(window, container);
    }
}

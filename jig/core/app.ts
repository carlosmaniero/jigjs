import {Container, globalContainer, Inject} from "./di";
import {JigModule} from "./module";
import {Component, componentFactoryFor, JigWindow} from "../components/component";

export interface EntryPointOptions {
    bootstrap: new(...args: unknown[]) => any;
    components?: any[];
    modules?: JigModule[];
}

export interface AppInitializer {
    init(): Promise<void> | void;
}

export const AppInitializer = {
    InjectionToken: "AppInitializer"
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

    async registerCustomElementClass(window: JigWindow, container = globalContainer): Promise<void> {
        this.modules.forEach((module) => {
            module.register(window, container);
        });

        this.moduleRegisters.forEach((moduleRegister) => {
            moduleRegister(container).register(window, container);
        });

        this.options.components?.forEach((component) => {
            container.register(component, component);
            componentFactoryFor(component).registerComponent(window, container);
        });

        container.register(this.options.bootstrap, this.options.bootstrap);
        const bootstrapFactory = componentFactoryFor(this.options.bootstrap);
        bootstrapFactory.registerComponent(window, container);
        container.register(BootstrapInjectionToken, {useValue: bootstrapFactory.componentSelector});

        container.register(JigAppComponent, JigAppComponent);
        componentFactoryFor(JigAppComponent).registerComponent(window, container);
    }
}

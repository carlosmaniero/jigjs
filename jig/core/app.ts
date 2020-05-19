import {Container, globalContainer, Inject} from "./di";
import {JigModule} from "./module";
import {Component, componentFactoryFor, JigWindow} from "../components/component";
import {Renderable} from "../template/render";
import {Platform} from "./platform";

export interface EntryPointOptions {
    bootstrap: new(...args: unknown[]) => any;
    bundleName: string;
    components?: any[];
    modules?: JigModule[];
}

const BootstrapInjectionToken = 'JigBootstrap';

@Component('jig-app')
export class JigAppComponent {
    constructor(@Inject(BootstrapInjectionToken) private readonly bootstrap: any) {}

    render(): Renderable {
        return document.createElement(this.bootstrap);
    }
}

export class JigApp {
    private readonly moduleRegisters: ((container: Container) => JigModule)[] = [];
    private modules: JigModule[];

    constructor(private readonly options: Readonly<EntryPointOptions>) {
        this.modules = options.modules || [];
    }

    registerModuleUsingContainer(moduleRegister: (container: Container) => JigModule): JigApp {
        this.moduleRegisters.push(moduleRegister);
        return this;
    }

    withModule(module: JigModule): JigApp {
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
        const platform = container.resolve<Platform>(Platform);

        componentFactoryFor(JigAppComponent).registerComponent(window, container);

        this.appendBundleFile(window, platform);
    }

    private appendBundleFile(window: Window, platform: Platform): void {
        if (!platform.isBrowser) {
            const script = window.document.createElement('script');
            script.src = `/${this.options.bundleName}.app.js`;

            if (window.document.head.querySelectorAll(`script[src="${script.src}"]`).length > 0) {
                return;
            }

            window.document.head.appendChild(script);
        }
    }
}

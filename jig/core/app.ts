import {Container, globalContainer, Inject} from "./di";
import {JigModule} from "./module";
import {AnyComponent, Component, componentFactoryFor, JigWindow} from "../components/component";
import {Renderable} from "../template/render";
import {Platform} from "./platform";
import {DefaultErrorHandlerComponent} from "../error/default-error-handler-component";
import {ErrorHandler, ErrorHandlerComponentClassInjectionToken} from "../error/error-handler";

export interface EntryPointOptions {
    bootstrap: AnyComponent;
    bundleName: string;
    errorHandlerComponent?: AnyComponent;
    components?: AnyComponent[];
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
        container.register(ErrorHandlerComponentClassInjectionToken, {useValue: this.getErrorHandlerComponent()});
        container.register(ErrorHandler, ErrorHandler);

        this.modules.forEach((module) => {
            module.register(window, container);
        });

        this.moduleRegisters.forEach((moduleRegister) => {
            moduleRegister(container).register(window, container);
        });

        this.getComponents().forEach((component) => {
            container.register(component, component);
            componentFactoryFor(component).registerComponent(window, container);
        });

        const bootstrapFactory = componentFactoryFor(this.options.bootstrap);

        container.register(BootstrapInjectionToken, {useValue: bootstrapFactory.componentSelector});
        container.register(JigAppComponent, JigAppComponent);
        const platform = container.resolve<Platform>(Platform);

        componentFactoryFor(JigAppComponent).registerComponent(window, container);

        this.appendBundleFile(window, platform);
    }

    private getComponents(): AnyComponent[] {
        const optionsComponents = this.options.components || [];
        return [
            ...optionsComponents,
            this.getErrorHandlerComponent(),
            this.options.bootstrap
        ];
    }

    private getErrorHandlerComponent(): AnyComponent {
        return this.options.errorHandlerComponent || DefaultErrorHandlerComponent;
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

import {JigJoyWindow, RehydrateService} from "../components/component";
import {DIContainer, DIInjectionToken, DIRegistration} from "./di";
import {componentFactoryFor} from "../components/annotation";


type ModuleProvider<T> = DIRegistration<T> & { provide: DIInjectionToken<T> };

interface JigJoyModuleProps {
    components?: any[],
    providers?: ModuleProvider<any>[],
    modules?: JigJoyModule[]
}

type RegistrationCallback = (container: DIContainer) => JigJoyModule;

export class JigJoyModule {
    private readonly registrationCallbacks: RegistrationCallback[];

    constructor(private readonly props: JigJoyModuleProps = {}) {
        this.registrationCallbacks = [];
    }

    register(window: JigJoyWindow, container) {
        const rehydrateService: RehydrateService = container.resolve(RehydrateService.InjectionToken);

        this.props.modules?.forEach((module) => {
            module.register(window, container);
        });

        this.props.providers?.forEach((provider) => {
            container.register(provider.provide, provider as any);
        });

        this.props.components?.forEach((component) => {
            componentFactoryFor(component).registerComponent(window, container);
        });

        this.registrationCallbacks.forEach((callback) => {
            callback(container).register(window, container);
        });
    }

    andThen(afterRegistration: (container) => JigJoyModule) {
        this.registrationCallbacks.push(afterRegistration);
        return this;
    }
}

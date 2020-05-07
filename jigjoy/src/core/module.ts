import {Component, JigJoyWindow, RehydrateService} from "../components/component";
import {DIContainer, DIInjectionToken, DIRegistration} from "./di";


type ModuleProvider<T> = DIRegistration<T> & { provide: DIInjectionToken<T> };

interface JigJoyModuleProps {
    components?: Component[],
    providers?: ModuleProvider<any>[],
    modules?: JigJoyModule[]
}

type RegistrationCallback = (container: DIContainer) => JigJoyModule;

export class JigJoyModule {
    private readonly registrationCallbacks: RegistrationCallback[];

    constructor(private readonly props: JigJoyModuleProps = {}) {
        this.registrationCallbacks = [];
    }

    register(myWindow: JigJoyWindow, container) {
        const rehydrateService: RehydrateService = container.resolve(RehydrateService.InjectionToken);

        this.props.modules?.forEach((module) => {
            module.register(myWindow, container);
        });

        this.props.providers?.forEach((provider) => {
            container.register(provider.provide, provider as any);
        });

        this.props.components?.forEach((component) => {
            component.registerCustomElementClass(myWindow, rehydrateService);
        });

        this.registrationCallbacks.forEach((callback) => {
            callback(container).register(myWindow, container);
        });
    }

    andThen(afterRegistration: (container) => JigJoyModule) {
        this.registrationCallbacks.push(afterRegistration);
        return this;
    }
}

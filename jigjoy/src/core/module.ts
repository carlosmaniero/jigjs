import {Component, JigJoyWindow} from "../components/component";
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

    constructor(private readonly props: JigJoyModuleProps) {
        this.registrationCallbacks = [];
    }

    register(window: JigJoyWindow) {
        this.props.modules?.forEach((module) => {
            module.register(window);
        });

        this.props.providers?.forEach((provider) => {
            DIContainer.register(provider.provide, provider as any);
        });

        this.props.components?.forEach((component) => {
            component.registerCustomElementClass(window);
        });

        this.registrationCallbacks.forEach((callback) => {
            callback(DIContainer).register(window);
        });
    }

    andThen(afterRegistration: (container) => JigJoyModule) {
        this.registrationCallbacks.push(afterRegistration);
        return this;
    }
}

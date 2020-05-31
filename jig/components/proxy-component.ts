import {constructor, Container, Inject} from "../core/di";
import {AnyComponent, propsMetadata, RequiredComponentMethods, stateCopyKey} from "../components/component";
import {createStateProxy, stateMetadata} from "./component-state";

export const createComponentPropsProxy = <T>(props: string[], component: constructor<T>, subjectKey: string): void => {
    props.forEach((prop) => {
        Object.defineProperty(component.prototype, prop, {
            get(): unknown {
                return this[`__jig__prop__composable__${prop}`];
            },
            set(value: unknown) {
                this[subjectKey][prop] = value;
                this[`__jig__prop__composable__${prop}`] = value;
            }
        });
    });
}

const originalStateKey = `${stateCopyKey}_original`;

export const createProxyComponentFor = (component: AnyComponent, props: string[]): AnyComponent => {
    class ProxyComponent {
        private readonly componentInstance: RequiredComponentMethods;

        constructor(@Inject(Container) private readonly container: Container) {
            this.componentInstance = container.resolve(component);
            const stateKey = stateMetadata.getStateProperty(this.componentInstance);
            const updateState = this.updateState.bind(this);

            if (stateKey) {
                const proxyToComponentState = this.createProxyToComponentState.bind(this);
                proxyToComponentState(stateKey, this.componentInstance[stateKey]);

                Object.defineProperty(this.componentInstance, stateKey, {
                    get(): unknown {
                        return this[stateCopyKey];
                    },
                    set(state: unknown) {
                        proxyToComponentState(stateKey, state);
                        updateState(stateKey, state);
                    }
                })
            }
        }

        private updateState(stateKey: string): void {
            this[stateKey] = this.componentInstance[originalStateKey];
        }

        private createProxyToComponentState(stateKey: string, state: unknown): void {
            this.componentInstance[originalStateKey] = state;
            this.componentInstance[stateCopyKey] =
                createStateProxy(() => this.updateState(stateKey))(state);
        }
    }

    propsMetadata.setProps(ProxyComponent.prototype, props);
    const stateKey = stateMetadata.getStateProperty(component.prototype);
    stateMetadata.setStateProperty(ProxyComponent.prototype, stateKey);

    for (const prop of [...Object.getOwnPropertyNames(component.prototype), stateKey]) {
        if (prop !== 'constructor') {
            Object.defineProperty(ProxyComponent.prototype, prop, {
                get(): unknown {
                    const componentInstanceElement = this.componentInstance[prop];

                    if (typeof componentInstanceElement === 'function') {
                        return componentInstanceElement.bind(this.componentInstance);
                    }

                    return componentInstanceElement;
                },
                set(value: unknown) {
                    this.componentInstance[prop] = value;
                }
            });
        }
    }

    return ProxyComponent as any;
}

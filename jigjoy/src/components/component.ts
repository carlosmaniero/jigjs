import {DIContainer, Injectable} from "../core/di";
import {html as templateHtml, render, Renderable} from "../template/render";
import {htmlParsedElementFactory} from "../third-party/html-parsed-element";
import {Platform} from "../core/platform";

export const html = templateHtml;
export type RenderResult = Renderable;
export type JigJoyWindow = Window & {
    HTMLElement: typeof HTMLElement
}

export interface OnMount {
    mount: () => void
}

export interface OnUnmount {
    unmount: () => void
}

export interface OnRehydrate {
    rehydrate: () => void
}

type RequiredComponentMethods = {
    render: () => Renderable,
} & (OnMount | OnUnmount | OnRehydrate | {});

type Constructor<T> = {
    new (...args: any[]): T;
}

export interface RehydrateService {
    createContext(): string;

    updateContext<T>(contextName: string, object: T): void;

    getContext<T>(contextName: string): T;
}

export const RehydrateService = {
    InjectionToken: 'RehydrateService'
}
type Factory = {
    registerComponent: (window: JigJoyWindow, container: DIContainer) => void,
    componentSelector: string
};

export const componentFactoryFor = <T extends RequiredComponentMethods>(component: Constructor<T>) => {
    const factory: Factory = Reflect.getMetadata("design:type", component, "componentFactory");

    return factory;
}

export const StateFactoryWithValue = <T extends Object>(changeCallback: () => void) => (value: T) => {
    for (let key in value) {
        if (value.hasOwnProperty(key) && typeof value[key] == 'object') {
            (value as any)[key] = StateFactoryWithValue(changeCallback)(value[key])
        }
    }

    return new Proxy(value, {
        set(target: T, p: PropertyKey, value: any): boolean {
            if (typeof value === 'object') {
                target[p] = StateFactoryWithValue(changeCallback)(value);
            } else {
                target[p] = value;
            }

            changeCallback();
            return true;
        },
        get(target: T, p: PropertyKey): any {
            return target[p];
        }
    });
}

export const State = () => (target: any, propertyKey: string) => {
    Reflect.defineMetadata("design:type", propertyKey, target, "stateProperty");
}

export const Prop = () => (target: any, propertyKey: string) => {
    const props = Reflect.getMetadata("design:type", target, "componentProperties") || [];
    Reflect.defineMetadata("design:type", [...props, propertyKey], target, "componentProperties");
}

export const ComponentAnnotation = <T extends RequiredComponentMethods>(selector: string, observableAttributes: string[] = []) =>
    (component: Constructor<T>) => {
        Injectable()(component);

        class ComponentFactory implements Factory {
            get componentSelector() {
                return selector;
            }

            public registerComponent(window: JigJoyWindow, container: DIContainer) {
                const rehydrateService: RehydrateService = container.resolve(RehydrateService.InjectionToken);
                const platform: Platform = container.resolve(Platform);
                const REHYDRATE_CONTEXT_ATTRIBUTE_NAME = 'rehydrate-context-name';
                const stateCopyKey = '__jigjoy__state__';

                const HTMLParsedElement = htmlParsedElementFactory(window);

                window.customElements.define(selector, HTMLParsedElement.withParsedCallback(class extends window.HTMLElement {
                    private readonly updateRender: () => void;
                    private readonly componentInstance: T;
                    private readonly stateKey?: string;
                    private readonly props?: Record<string, any>;

                    constructor() {
                        super();

                        this.componentInstance = this.createComponentInstance();
                        this.registerProps();
                        this.updateRender = () => render(this.render())(this);

                        this.stateKey = Reflect.getMetadata("design:type", this.componentInstance, "stateProperty");
                        this.registerStateChangeListener();
                    }

                    private registerStateChangeListener() {
                        const componentInstance = this.componentInstance;

                        if (this.stateKey) {
                            this.setComponentInstanceState(componentInstance[this.stateKey]);

                            Object.defineProperty(componentInstance, this.stateKey, {
                                set: (value) => {
                                    this.setComponentInstanceState(value);
                                    this.stateChanged();
                                },
                                get: () => {
                                    return componentInstance[stateCopyKey];
                                }
                            });
                        }
                    }

                    shouldUpdate(to) {
                        if ((this.componentInstance as any).shouldUpdate) {
                            return (this.componentInstance as any).shouldUpdate({
                                to, from: this
                            });
                        }
                        return true;
                    }

                    parsedCallback() {
                        if (platform.isBrowser) {
                            this.triggerLifeCycle();
                        }
                    }

                    connectedCallback() {
                        if (!platform.isBrowser) {
                            this.triggerLifeCycle();
                        }
                    }

                    private triggerLifeCycle() {
                        if (this.hasAttribute(REHYDRATE_CONTEXT_ATTRIBUTE_NAME)) {
                            const context = rehydrateService.getContext(this.getContextName());

                            this.setComponentInstanceState(context);

                            if (this.hasRehydrate(this.componentInstance)) {
                                this.componentInstance.rehydrate();
                            }
                            return;
                        }

                        this.setAttribute(REHYDRATE_CONTEXT_ATTRIBUTE_NAME, rehydrateService.createContext());

                        if (this.stateKey) {
                            rehydrateService.updateContext(this.getContextName(), this.getComponentState());
                        }

                        if (this.hasMountMethod(this.componentInstance)) {
                            this.componentInstance.mount();
                        }
                        this.updateRender();
                    }

                    private getContextName() {
                        return this.getAttribute(REHYDRATE_CONTEXT_ATTRIBUTE_NAME);
                    }

                    private setComponentInstanceState(context) {
                        if (!context) {
                            return
                        }
                        this.componentInstance[stateCopyKey] =
                            StateFactoryWithValue(() => this.stateChanged())(context);
                    }

                    disconnectedCallback() {
                        if(this.hasUnmountMethod(this.componentInstance)) {
                            this.componentInstance.unmount();
                        }
                    }

                    render() {
                        return this.componentInstance.render();
                    }

                    private hasMountMethod(componentInstance: T): componentInstance is T & OnMount {
                        return 'mount' in componentInstance;
                    }

                    private hasUnmountMethod(componentInstance: T): componentInstance is T & OnUnmount {
                        return 'unmount' in componentInstance;
                    }

                    private hasRehydrate(componentInstance: T): componentInstance is T & OnRehydrate {
                        return 'rehydrate' in componentInstance;
                    }

                    private createComponentInstance() {
                        return container.resolve(component);
                    }

                    private stateChanged() {
                        this.updateRender();
                        rehydrateService.updateContext(this.getContextName(), this.getComponentState())
                    }

                    private getComponentState() {
                        return this.componentInstance[this.stateKey];
                    }

                    private registerProps() {
                        const props = this.props || {};
                        const expectedProps = Reflect.getMetadata("design:type", this.componentInstance, "componentProperties") || [];

                        expectedProps.forEach((propName) => {
                            this.componentInstance[propName] = props[propName];
                        });
                    }
                }));
            }
        }

        Reflect.defineMetadata("design:type", new ComponentFactory(), component, "componentFactory");
    }

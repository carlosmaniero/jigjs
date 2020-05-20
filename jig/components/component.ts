import {Container, Injectable} from "../core/di";
import {html as templateHtml, render, Renderable} from "../template/render";
import {htmlParsedElementFactory} from "../third-party/html-parsed-element";
import {Platform} from "../core/platform";
import {Target} from "@abraham/reflection";
import {ComponentLifecycle} from "./component-lifecycle";
import {createStateProxy, stateMetadata} from "./component-state";

export const html = templateHtml;
export type RenderResult = Renderable;
export type JigWindow = Window & {
    HTMLElement: typeof HTMLElement;
}

type RequiredComponentMethods = {
    render: () => Renderable;
};

type Constructor<T> = {
    new(...args: unknown[]): T;
}

export interface RehydrateService {
    incrementalContextName(): string;

    updateContext<T>(contextName: string, object: T): void;

    getContext<T>(contextName: string): T;
}

export const RehydrateService = {
    InjectionToken: 'RehydrateService'
}

type Factory = {
    registerComponent: (window: JigWindow, container: Container) => void;
    componentSelector: string;
};

const componentFactoryMetadata = {
    createComponentFactory<T>(componentClass1: Constructor<T>, componentFactory: Factory): void {
        Reflect.defineMetadata("design:type", componentFactory, componentClass1, "componentFactory");
    },
    getComponentFactoryFor<T>(component: Constructor<T>): Factory {
        return Reflect.getMetadata("design:type", component, "componentFactory")
    }
}

export const componentFactoryFor = <T extends RequiredComponentMethods>(component: Constructor<T>): Factory => {
    return componentFactoryMetadata.getComponentFactoryFor(component);
}

export const State = () => (target: Target, propertyKey: string): void => {
    stateMetadata.setStateProperty(target, propertyKey);
}

const propsMetadata = {
    appendProps(target: Target, propertyKey: string): void {
        const props: string[] = Reflect.getMetadata("design:type", target, "componentProperties") || [];
        Reflect.defineMetadata("design:type", [...props, propertyKey], target, "componentProperties");
    },
    getProps<T extends Target>(componentInstance: T): string[] {
        return Reflect.getMetadata("design:type", componentInstance, "componentProperties") || [];
    }
}

export const Prop = () => (target: Target, propertyKey: string): void => {
    propsMetadata.appendProps(target, propertyKey);
}

export const Component = <T extends RequiredComponentMethods>(selector: string) =>
    (componentClass: Constructor<T>): void => {
        Injectable()(componentClass);

        class ComponentFactory implements Factory {
            get componentSelector(): string {
                return selector;
            }

            public registerComponent(window: JigWindow, container: Container): void {
                const rehydrateService: RehydrateService = container.resolve(RehydrateService.InjectionToken);
                const platform: Platform = container.resolve(Platform);
                const REHYDRATE_CONTEXT_ATTRIBUTE_NAME = 'rehydrate-context-name';
                const stateCopyKey = '__jig__state__';

                const HTMLParsedElement = htmlParsedElementFactory(window);

                window.customElements.define(selector, HTMLParsedElement.withParsedCallback(class extends window.HTMLElement {
                    private readonly componentInstance: T;
                    private readonly stateKey?: string;
                    private readonly props?: Record<string, unknown>;
                    private componentLifecycle: ComponentLifecycle<T>;

                    constructor() {
                        super();

                        this.componentInstance = this.createComponentInstance();
                        this.componentLifecycle = new ComponentLifecycle(this.componentInstance);
                        this.stateKey = stateMetadata.getStateProperty(this.componentInstance);
                        this.registerStateChangeListener();
                    }

                    public parsedCallback(): void {
                        if (platform.isBrowser) {
                            this.triggerLifeCycle();
                        }
                    }

                    public connectedCallback(): void {
                        if (!platform.isBrowser) {
                            this.triggerLifeCycle();
                        }
                    }

                    public disconnectedCallback(): void {
                        this.componentLifecycle.unmount();
                    }

                    shouldUpdate(newThis): boolean {
                        this.parentComponentUpdatedThisComponent(newThis);
                        return false;
                    }

                    private parentComponentUpdatedThisComponent(newThis): void {
                        this.registerProps(newThis.props, this.componentInstance);

                        if (!this.componentLifecycle.shouldUpdate()) {
                            return;
                        }

                        this.updateRender();
                    }

                    private registerStateChangeListener(): void {
                        const componentInstance = this.componentInstance;

                        if (this.stateKey) {
                            this.createProxyToComponentState(componentInstance[this.stateKey]);

                            Object.defineProperty(componentInstance, this.stateKey, {
                                set: (value) => {
                                    this.createProxyToComponentState(value);
                                    this.stateChanged();
                                },
                                get: () => {
                                    return componentInstance[stateCopyKey];
                                }
                            });
                        }
                    }

                    private updateRender(): void {
                        render(this.render())(this);
                        this.componentLifecycle.afterRender();
                    }

                    private triggerLifeCycle(): void {
                        if (this.canBeRehydrated()) {
                            this.rehydrate();
                            return;
                        }

                        this.createComponentRehydrateContext();
                        this.mount();
                    }

                    private mount(): void {
                        this.componentLifecycle.mount();
                        this.updateRender();
                    }

                    private createComponentRehydrateContext(): void {
                        this.setAttribute(REHYDRATE_CONTEXT_ATTRIBUTE_NAME, rehydrateService.incrementalContextName());

                        if (this.stateKey) {
                            rehydrateService.updateContext(this.getContextName(), this.getComponentState());
                        }
                    }

                    private canBeRehydrated(): boolean {
                        return this.hasAttribute(REHYDRATE_CONTEXT_ATTRIBUTE_NAME);
                    }

                    private rehydrate(): void {
                        const state = rehydrateService.getContext(this.getContextName());
                        this.createProxyToComponentState(state);
                        this.componentLifecycle.rehydrate();
                        this.afterRehydrate();
                    }

                    private afterRehydrate(): boolean {
                        if (!this.componentLifecycle.shouldRenderAfterRehydrate()) {
                            return;
                        }

                        this.updateRender();
                    }

                    private getContextName(): string {
                        return this.getAttribute(REHYDRATE_CONTEXT_ATTRIBUTE_NAME);
                    }

                    private createProxyToComponentState(state): void {
                        if (!state) {
                            return
                        }
                        this.componentInstance[stateCopyKey] =
                            createStateProxy(() => this.stateChanged())(state);
                    }

                    private render(): Renderable {
                        return this.componentInstance.render();
                    }

                    private createComponentInstance(): T {
                        const componentInstance = container.resolve(componentClass);
                        this.registerProps(this.props, componentInstance);
                        return componentInstance;
                    }

                    private stateChanged(): void {
                        this.updateRender();
                        rehydrateService.updateContext(this.getContextName(), this.getComponentState())
                    }

                    private getComponentState(): unknown {
                        return this.componentInstance[this.stateKey];
                    }

                    private registerProps(elementProps: Record<string, unknown>, componentInstance: T): void {
                        const props = elementProps || {};
                        const expectedProps: string[] = propsMetadata.getProps(componentInstance);

                        expectedProps.forEach((propName) => {
                            componentInstance[propName] = props[propName];
                        });
                    }
                }));
            }
        }

        componentFactoryMetadata.createComponentFactory(componentClass, new ComponentFactory());
    }

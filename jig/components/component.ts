import {Container, Injectable} from "../core/di";
import {createTemplateElement, html as templateHtml, render, Renderable} from "../template/render";
import {Target} from "@abraham/reflection";
import {ComponentLifecycle} from "./component-lifecycle";
import {createStateProxy, stateMetadata} from "./component-state";

export const html = templateHtml;
export type RenderResult = Renderable;
export type JigWindow = Window & {
    HTMLElement: typeof HTMLElement;
}

interface RequiredComponentMethods {
    render(): Renderable;
}

export interface RehydrateData {
    state: Record<string, unknown>;
}

type Constructor<T> = {
    new(...args: unknown[]): T;
}

export type AnyComponent = Constructor<RequiredComponentMethods>;

export interface RehydrateService {
    incrementalContextName(): string;

    updateContext<T>(contextName: string, object: T): void;

    getContext<T>(contextName: string): T;
}

export const RehydrateService = {
    InjectionToken: 'RehydrateService'
}

export type Factory = {
    registerComponent: (window: JigWindow, container: Container) => void;
    componentSelector: string;
};

const componentFactoryMetadata = {
    createComponentFactory<T>(componentClass1: Constructor<T>, componentFactory: Factory): void {
        Reflect.defineMetadata("design:type", componentFactory, componentClass1, "componentFactory");
    },
    getComponentFactoryFor<T>(component: Constructor<T>): Factory {
        return Reflect.getMetadata("design:type", component, "componentFactory");
    }
}

export const componentFactoryFor = <T extends RequiredComponentMethods>(component: Constructor<T>): Factory => {
    return componentFactoryMetadata.getComponentFactoryFor(component);
}

export const lazyLoadComponent = <T extends RequiredComponentMethods>(
    document,
    component: Constructor<T>,
    props: Record<string, unknown> = {}): ChildNode => {

    const template = createTemplateElement(document);
    const componentSelector = componentFactoryFor(component).componentSelector;
    template.innerHTML = `<${componentSelector}></${componentSelector}>`
    const componentElement = template.content.childNodes[0];

    (componentElement as any).props = props;

    return componentElement;
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

type RegisterProps<T extends RequiredComponentMethods> = {
    elementProps: Record<string, unknown>;
    componentInstance: T;
    attributesElement: HTMLElement;
    sendUpdateMessage?: boolean;
};
export const Component = <T extends RequiredComponentMethods>(selector: string) =>
    (componentClass: Constructor<T>): void => {
        Injectable()(componentClass);

        class ComponentFactory implements Factory {
            get componentSelector(): string {
                return selector;
            }

            public registerComponent(window: JigWindow, container: Container): void {
                const REHYDRATE_CONTEXT_ATTRIBUTE_NAME = 'rehydrate-context-name';
                const stateCopyKey = '__jig__state__';

                window.customElements.define(selector, class extends window.HTMLElement {
                    private readonly componentInstance: T;
                    private readonly stateKey?: string;
                    private readonly props?: Record<string, unknown>;
                    private componentLifecycle: ComponentLifecycle<T>;
                    private rehydrateService: RehydrateService;

                    constructor() {
                        super();

                        this.componentInstance = this.createComponentInstance();
                        this.componentLifecycle = new ComponentLifecycle(this.componentInstance);
                        this.stateKey = stateMetadata.getStateProperty(this.componentInstance);
                        this.rehydrateService = container.resolve(RehydrateService.InjectionToken);
                        this.registerStateChangeListener();
                    }

                    public connectedCallback(): void {
                        this.triggerLifeCycle();
                    }

                    public disconnectedCallback(): void {
                        this.componentLifecycle.unmount();
                    }

                    shouldUpdate(newThis): boolean {
                        this.parentComponentUpdatedThisComponent(newThis);
                        return false;
                    }

                    private parentComponentUpdatedThisComponent(newThis): void {
                        this.registerProps({
                            elementProps: newThis.props,
                            componentInstance: this.componentInstance,
                            attributesElement: newThis
                        });

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
                        if (!this.componentLifecycle.shouldUpdate()) {
                            return;
                        }
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
                        this.setAttribute(REHYDRATE_CONTEXT_ATTRIBUTE_NAME, this.rehydrateService.incrementalContextName());

                        if (this.stateKey) {
                            this.updateRehydrateContext();
                        }
                    }

                    private canBeRehydrated(): boolean {
                        return this.hasAttribute(REHYDRATE_CONTEXT_ATTRIBUTE_NAME);
                    }

                    private rehydrate(): void {
                        const {state} = this.rehydrateService.getContext<RehydrateData>(this.getContextName()) || {};
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
                        this.registerProps({
                            elementProps: this.props,
                            componentInstance: componentInstance,
                            attributesElement: this,
                            sendUpdateMessage: true
                        });
                        return componentInstance;
                    }

                    private updateRehydrateContext() {
                        this.rehydrateService.updateContext(this.getContextName(), {
                            state: this.getComponentState()
                        });
                    }

                    private stateChanged(): void {
                        this.updateRender();
                        this.updateRehydrateContext();
                    }

                    private getComponentState(): unknown {
                        return this.componentInstance[this.stateKey];
                    }

                    private registerProps({elementProps, componentInstance, sendUpdateMessage = false, attributesElement}: RegisterProps<T>): void {
                        const props = elementProps || {};
                        const expectedProps: string[] = propsMetadata.getProps(componentInstance);
                        const oldProps = {};
                        const currentProps = {};

                        expectedProps.forEach((propName) => {
                            oldProps[propName] = componentInstance[propName];

                            if (propName in props) {
                                componentInstance[propName] = props[propName];
                                currentProps[propName] = props[propName];
                                return;
                            }

                            componentInstance[propName] = attributesElement.getAttribute(propName);
                            currentProps[propName] = attributesElement.getAttribute(propName);
                        });

                        if (!sendUpdateMessage && JSON.stringify(oldProps) !== JSON.stringify(currentProps)) {
                            this.componentLifecycle.propsChanged(oldProps);
                        }

                    }
                });
            }
        }

        componentFactoryMetadata.createComponentFactory(componentClass, new ComponentFactory());
    }

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

export interface RequiredComponentMethods {
    render(): Renderable;
}

export interface RehydrateData {
    state: Record<string, unknown>;
    props: Record<string, unknown>;
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

export interface PropsSnapshot {
    oldProps: Record<string, unknown>;
    currentProps: Record<string, unknown>;
}

export const RehydrateService = {
    InjectionToken: 'RehydrateService'
}

export type Factory = {
    registerComponent: (window: JigWindow, container: Container) => void;
    componentSelector: string;
};

export const componentFactoryMetadata = {
    createComponentFactory<T>(componentClass1: Constructor<T>, componentFactory: Factory): void {
        Reflect.defineMetadata("design:type", componentFactory, componentClass1, "componentFactory");
    },
    forwardFactoryTo<ComponentType, SubjectType>(subject: Constructor<SubjectType>, component: Constructor<ComponentType>): void {
        Reflect.defineMetadata("design:type", component, subject, "forwardFactory");
    },
    getForwardFactory<T>(subject: Constructor<unknown>): Constructor<T> {
        return Reflect.getMetadata("design:type", subject, "forwardFactory")
    },
    getComponentFactoryFor<T>(component: Constructor<T>): Factory {
        const metadata = Reflect.getMetadata<Factory>("design:type", component, "componentFactory");
        if (metadata) {
            return metadata;
        }
        return this.getComponentFactoryFor(this.getForwardFactory(component));
    }
}

export const componentFactoryFor = <T>(component: Constructor<T>): Factory => {
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

export const propsMetadata = {
    appendProps(target: Target, propertyKey: string): void {
        const props: string[] = Reflect.getMetadata("design:type", target, "componentProperties") || [];
        Reflect.defineMetadata("design:type", [...props, propertyKey], target, "componentProperties");
    },
    setProps(target: Target, props: string[]): void {
        Reflect.defineMetadata("design:type", [...props], target, "componentProperties");
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
    ignorePropsChanged?: boolean;
};

export interface ComponentOptions<T> {
    configureContainer?: (container: Container) => void;
}

export const Component = <T extends RequiredComponentMethods>(selector: string, options: ComponentOptions<T> = {}) =>
    (componentClass: Constructor<T>): void => {
        Injectable()(componentClass);

        class ComponentFactory implements Factory {
            get componentSelector(): string {
                return selector;
            }

            public registerComponent(window: JigWindow, parentContainer: Container): void {
                const REHYDRATE_CONTEXT_ATTRIBUTE_NAME = 'rehydrate-context-name';
                const stateCopyKey = '__jig__state__';

                const container = parentContainer.createChildContainer();
                options.configureContainer && options.configureContainer(container);

                window.customElements.define(selector, class extends window.HTMLElement {
                    private readonly componentInstance: T;
                    private readonly stateKey?: string;
                    private readonly props?: Record<string, unknown>;
                    private componentLifecycle: ComponentLifecycle<T>;
                    private rehydrateService: RehydrateService;

                    constructor() {
                        super();

                        this.componentInstance = this.createComponentInstance();
                        this.stateKey = stateMetadata.getStateProperty(this.componentInstance);
                        this.rehydrateService = container.resolve(RehydrateService.InjectionToken);
                        this.registerStateChangeListener();
                        this.componentLifecycle = this.createComponentLifecycle();
                    }

                    connectedCallback(): void {
                        this.setupRehydrateContext();
                        this.componentLifecycle.start();
                    }

                    disconnectedCallback(): void {
                        this.componentLifecycle.unmount();
                    }


                    shouldUpdate(newThis): boolean {
                        this.parentComponentUpdatedThisComponent(newThis);
                        return false;
                    }

                    private createComponentInstance(): T {
                        return container.resolve<T>(componentClass);
                    }

                    private createComponentLifecycle(): ComponentLifecycle<T> {
                        const rehydrationContextGetter = (): RehydrateData | null => {
                            return this.getRehydrationContext();
                        }

                        const rehydrationContextSetter = (context: RehydrateData | null): void => {
                            this.updateRehydrateContextWith(context);
                        }

                        return new ComponentLifecycle(this.componentInstance, {
                            get preRenderContext(): RehydrateData | null {
                                return rehydrationContextGetter();
                            },
                            set preRenderContext(context) {
                                rehydrationContextSetter(context);
                            },
                            initialProps: this.getInitialProps({
                                elementProps: this.props,
                                componentInstance: this.componentInstance,
                                attributesElement: this,
                                ignorePropsChanged: true,
                            }),
                            propsKeys: propsMetadata.getProps(this.componentInstance),
                            stateKey: stateMetadata.getStateProperty(this.componentInstance),
                            updateRender: (renderable): void => this.updateRenderable(renderable)
                        });
                    }

                    private parentComponentUpdatedThisComponent(newThis): void {
                        const {currentProps, oldProps} = this.createPropsSnapshot({
                            elementProps: newThis.props,
                            componentInstance: this.componentInstance,
                            attributesElement: newThis
                        });

                        if (JSON.stringify(oldProps) === JSON.stringify(currentProps)) {
                            return;
                        }

                        this.componentLifecycle.onPropsChanged(currentProps, oldProps);
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

                    private updateRenderable(renderable: Renderable): void {
                        render(renderable)(this);
                    }

                    private setupRehydrateContext(): void {
                        if (!this.hasRehydrationContext()) {
                            this.createComponentRehydrateContext();
                        }
                    }

                    private createComponentRehydrateContext(): void {
                        this.setAttribute(REHYDRATE_CONTEXT_ATTRIBUTE_NAME, this.rehydrateService.incrementalContextName());
                    }

                    private hasRehydrationContext(): boolean {
                        return this.hasAttribute(REHYDRATE_CONTEXT_ATTRIBUTE_NAME);
                    }

                    private getRehydrationContext(): RehydrateData | null {
                        const context = this.rehydrateService.getContext<RehydrateData>(this.getContextName());

                        if (!this.hasRehydrationContext() || !context) {
                            return null;
                        }

                        return context;
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

                    private updateRehydrateContextWith(context: { props: unknown; state: unknown }): void {
                        this.rehydrateService.updateContext(this.getContextName(), {
                            state: context.state,
                            props: context.props
                        });
                    }

                    private stateChanged(): void {
                        this.componentLifecycle.onStateChange();
                    }

                    private getInitialProps(registerProps: RegisterProps<T>): Record<string, unknown> {
                        return this.createPropsSnapshot(registerProps).currentProps;
                    }

                    private createPropsSnapshot(registerProps: RegisterProps<T>): PropsSnapshot {
                        const props = this.applyElementAttributeCaseToProps(registerProps.elementProps);
                        const expectedProps: string[] = propsMetadata.getProps(registerProps.componentInstance);
                        const oldProps = {};
                        const currentProps = {};

                        expectedProps.forEach((propName) => {
                            oldProps[propName] = (registerProps.componentInstance)[propName];

                            if (propName.toLowerCase() in props) {
                                currentProps[propName] = props[propName.toLowerCase()];
                                return;
                            }

                            currentProps[propName] = registerProps.attributesElement.getAttribute(propName);
                        });

                        return {oldProps, currentProps};
                    }

                    private applyElementAttributeCaseToProps(elementProps?: Record<string, unknown>): Record<string, unknown> {
                        if (!elementProps) {
                            return {}
                        }
                        return Object.keys(elementProps).reduce((acc, key) => {
                            return {...acc, [key.toLowerCase()]: elementProps[key]}
                        }, {});
                    }
                });
            }
        }

        componentFactoryMetadata.createComponentFactory(componentClass, new ComponentFactory());
    }

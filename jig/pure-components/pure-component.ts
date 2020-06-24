import {html as templateHtml, render as templateRender, Renderable} from "../template/render";
import {sideEffect, subscribeToConstruction, subscribeToSideEffects} from "../side-effect/side-effect";
import {Subscription} from "../events/subject";

const elementRenderControlSymbol = Symbol('element-render-control-symbol');
const componentLifecycleSymbol = Symbol('component-lifecycle-symbol');

const getComponentLifecycle = <T extends RenderableComponent>(component: T): ComponentLifecycle<T> => {
    return component[componentLifecycleSymbol];
}

const componentReflection = {
    isComponentSymbol: Symbol('is-component'),
    lifecycleProperty: Symbol('component-lifecycle'),
    markAsComponent<T extends RenderableComponent>(componentClass: Constructor<T>): void {
        Reflect.defineMetadata(this.isComponentSymbol, true, componentClass);
    },
    defineComponentLifecycle<T extends RenderableComponent>(componentClass: Constructor<T>, componentLifeCycle: ComponentConfiguration): void {
        Reflect.defineMetadata(this.lifecycleProperty, componentLifeCycle, componentClass);
    },
    getComponentConfiguration(component: object): ComponentConfiguration {
        const componentLifecycle: ComponentConfiguration =
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            Reflect.getMetadata(this.lifecycleProperty, component) || new ComponentConfiguration();
        this.defineComponentLifecycle(component, componentLifecycle);

        return componentLifecycle;
    },
    isComponent(component: object): component is RenderableComponent {
        if (!component) {
            return;
        }
        return !!Reflect.getMetadata(this.isComponentSymbol, component.constructor);
    }
}

const elementRenderControlFromElement = (element: HTMLElement): ComponentRenderControl => {
    return element[elementRenderControlSymbol];
}

const setElementRenderControl = (componentElement: HTMLElement, componentRenderControl: ComponentRenderControl): void => {
    componentElement[elementRenderControlSymbol] = componentRenderControl;
}

class RenderRacing {
    private willRender = false;

    render(componentInstance: RenderableComponent, element: HTMLElement): void {
        if (this.willRender) {
            return;
        }

        this.willRender = true;

        setTimeout(() => {
            if (!this.isElementControlledByThisInstance(element, componentInstance)) {
                return;
            }
            this.willRender = false;
            templateRender(componentInstance.render())(element);
        }, 0);
    }

    private isElementControlledByThisInstance(element: HTMLElement, componentInstance: RenderableComponent) {
        return elementRenderControlFromElement(element).componentInstance === componentInstance;
    }
}

class ComponentRenderControl {
    private subscription: Subscription;
    private renderRace: RenderRacing;

    constructor(
        public readonly componentInstance: RenderableComponent,
        private element: HTMLElement
    ) {
        this.renderRace = new RenderRacing();
    }

    subscribe(): void {
        this.subscription = subscribeToSideEffects(this.componentInstance, () => {
            this.renderRace.render(this.componentInstance, this.element);
        });
    }

    unsubscribe(): void {
        this.subscription.unsubscribe();
    }

    updateElement(element: HTMLElement): void {
        this.element = element;
    }
}

export const renderComponent = (element: HTMLElement, component: RenderableComponent): void => {
    const componentElement = document.createElement(component.constructor.name);
    const componentLifecycle = getComponentLifecycle(component);

    const componentRenderControl = new ComponentRenderControl(component, componentElement);
    componentRenderControl.subscribe();

    setElementRenderControl(componentElement, componentRenderControl);
    componentElement['shouldUpdate'] = (to): boolean => {
        const newComponentRenderControl: ComponentRenderControl = to[elementRenderControlSymbol];

        componentRenderControl.unsubscribe();
        setElementRenderControl(componentElement, newComponentRenderControl);

        newComponentRenderControl.updateElement(componentElement);
        return true;

    };
    templateRender(component.render())(componentElement);

    componentElement['onDisconnect'] = (): void => {
        componentLifecycle.disconnectedCallback();
    };
    componentElement['onConnect'] = (): void => {
        componentLifecycle.connectedCallback();
    }

    templateRender(componentElement)(element);
}

const renderComponentOrValue = (value: object | object[] | RenderableComponent): Renderable | Renderable[]  => {
    if (Array.isArray(value)) {
        return value.map(renderComponentOrValue) as Renderable[];
    }

    if (componentReflection.isComponent(value)) {
        const component = value;

        return {
            renderAt(document): DocumentFragment {
                const fragment = document.createDocumentFragment();
                renderComponent(fragment, component);
                return fragment;
            }
        };
    }

    return value as Renderable;
}

export const html = (template: TemplateStringsArray, ...values: unknown[]): Renderable => {
    const transformTemplateValues = values.map((value: object) => {
        return renderComponentOrValue(value);
    });
    return templateHtml(template, ...transformTemplateValues);
}

export interface RenderableComponent {
    render(): Renderable;
}

type Constructor<T> = {
    new(...args: unknown[]): T;
}

class ComponentConfiguration {
    private readonly connectedCallbackMethods: PropertyKey[] = [];
    private readonly disconnectedCallbackMethods: PropertyKey[] = [];
    private readonly allDisconnectedCallbackMethods: PropertyKey[] = [];

    addConnectedMethodName(methodName: PropertyKey): void {
        this.connectedCallbackMethods.push(methodName);
    }

    addDisconnectedMethodName(methodName: PropertyKey): void {
        this.disconnectedCallbackMethods.push(methodName);
    }

    addAllDisconnectedMethodName(methodName: PropertyKey): void {
        this.allDisconnectedCallbackMethods.push(methodName);
    }

    connectedCallback(component: object): void {
        this.connectedCallbackMethods.forEach((methodName) => {
            component[methodName]();
        })
    }

    disconnectedCallback(component: object): void {
        this.disconnectedCallbackMethods.forEach((methodName) => {
            component[methodName]();
        });
    }

    allDisconnectedCallback(component: object): void {
        this.allDisconnectedCallbackMethods.forEach((methodName) => {
            component[methodName]();
        });
    }
}

export const connectedCallback = <T extends object>() => (componentClass: T, methodName: PropertyKey): void => {
    componentReflection.getComponentConfiguration(componentClass)
        .addConnectedMethodName(methodName);
}


export const disconnectedCallback = <T extends object>() => (componentClass: T, methodName: PropertyKey): void => {
    componentReflection.getComponentConfiguration(componentClass)
        .addDisconnectedMethodName(methodName);
}

export const allDisconnectedCallback = <T extends object>() => (componentClass: T, methodName: PropertyKey): void => {
    componentReflection.getComponentConfiguration(componentClass)
        .addAllDisconnectedMethodName(methodName);
}

class ComponentLifecycle <T extends RenderableComponent> {
    private connectedCount = 0;
    constructor(
        private readonly instance: T, private readonly componentConfiguration: ComponentConfiguration) {
    }

    connectedCallback(): void {
        this.connectedCount++;
        this.componentConfiguration.connectedCallback(this.instance);
    }

    disconnectedCallback(): void {
        this.connectedCount--;
        this.componentConfiguration.disconnectedCallback(this.instance);

        if (this.connectedCount === 0) {
            this.componentConfiguration.allDisconnectedCallback(this.instance);
        }
    }
}

export const pureComponent = <T extends RenderableComponent>() => (componentClass: Constructor<T>): void => {
    componentReflection.markAsComponent(componentClass);
    const componentClassWithSideEffects = sideEffect()(componentClass);

    subscribeToConstruction(componentClassWithSideEffects, (instance: T) => {
        instance[componentLifecycleSymbol] =
            new ComponentLifecycle(instance, componentReflection.getComponentConfiguration(instance));
    });

    return componentClassWithSideEffects;
};

import {html as templateHtml, render as templateRender, Renderable} from "../template/render";
import {observable, observe, onConstruct} from "../side-effect/observable";
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

        Promise.resolve().then(() => {
            if (!this.isElementControlledByThisInstance(element, componentInstance)) {
                return;
            }
            this.willRender = false;
            templateRender(componentInstance.render())(element);
        });
    }

    private isElementControlledByThisInstance(element: HTMLElement, componentInstance: RenderableComponent): boolean {
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
        this.subscription = observe(this.componentInstance, () => {
            this.renderRace.render(this.componentInstance, this.element);
        });
    }

    unsubscribe(): void {
        this.subscription && this.subscription.unsubscribe();
        this.subscription = undefined;
    }

    updateElement(element: HTMLElement): void {
        this.element = element;
    }
}

export const renderComponent = (element: HTMLElement, component: RenderableComponent): void => {
    const componentElement = document.createElement(component.constructor.name);
    const componentLifecycle = getComponentLifecycle(component);

    const componentRenderControl = new ComponentRenderControl(component, componentElement);

    componentElement['bindPreExisting'] = (from): void => {
        setElementRenderControl(from, componentRenderControl);
        componentRenderControl.updateElement(from);
    }

    setElementRenderControl(componentElement, componentRenderControl);
    componentElement['shouldUpdate'] = (to): boolean => {
        const newComponentRenderControl: ComponentRenderControl = to[elementRenderControlSymbol];

        elementRenderControlFromElement(componentElement).unsubscribe();
        setElementRenderControl(componentElement, newComponentRenderControl);

        newComponentRenderControl.updateElement(componentElement);
        newComponentRenderControl.subscribe();
        return true;

    };
    componentElement['onDisconnect'] = (): void => {
        elementRenderControlFromElement(componentElement).unsubscribe();
        componentLifecycle.disconnectedCallbackNode(componentElement);
    };
    componentElement['onConnect'] = (): void => {
        componentRenderControl.subscribe();
        componentLifecycle.connectedCallbackNode(componentElement);
    }

    templateRender(component.render())(componentElement);
    templateRender(componentElement)(element);
}

const renderComponentOrValue = (valueOrComponent: object | object[] | RenderableComponent): Renderable | Renderable[] => {
    if (Array.isArray(valueOrComponent)) {
        return valueOrComponent.map(renderComponentOrValue) as Renderable[];
    }

    if (componentReflection.isComponent(valueOrComponent)) {
        return {
            renderAt(document): DocumentFragment {
                const fragment = document.createDocumentFragment();
                renderComponent(fragment, valueOrComponent);
                return fragment;
            }
        };
    }

    return valueOrComponent as Renderable;
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
    private readonly connectedCallbackNodeMethods: PropertyKey[] = [];
    private readonly disconnectedNodeCallbackMethods: PropertyKey[] = [];
    private readonly disconnectedCallbackMethods: PropertyKey[] = [];
    private readonly connectedCallbackMethods: PropertyKey[] = [];

    addConnectedNodeMethodName(methodName: PropertyKey): void {
        this.connectedCallbackNodeMethods.push(methodName);
    }

    addConnectedMethodName(methodName: PropertyKey): void {
        this.connectedCallbackMethods.push(methodName);
    }

    addDisconnectedNodeMethodName(methodName: PropertyKey): void {
        this.disconnectedNodeCallbackMethods.push(methodName);
    }

    addDisconnectedMethodName(methodName: PropertyKey): void {
        this.disconnectedCallbackMethods.push(methodName);
    }

    connectedCallbackNode(component: object, element: HTMLElement): void {
        this.connectedCallbackNodeMethods.forEach((methodName) => {
            component[methodName](element);
        })
    }

    disconnectedNodeCallback(component: object, element: HTMLElement): void {
        this.disconnectedNodeCallbackMethods.forEach((methodName) => {
            component[methodName](element);
        });
    }

    disconnectedCallback(component: object): void {
        this.disconnectedCallbackMethods.forEach((methodName) => {
            component[methodName]();
        });
    }

    connectedCallback(component: object): void {
        this.connectedCallbackMethods.forEach((methodName) => {
            component[methodName]();
        });
    }
}

export const connectedCallbackNode = <T extends object>() => (componentClass: T, methodName: PropertyKey): void => {
    componentReflection.getComponentConfiguration(componentClass)
        .addConnectedNodeMethodName(methodName);
}

export const connectedCallback = <T extends object>() => (componentClass: T, methodName: PropertyKey): void => {
    componentReflection.getComponentConfiguration(componentClass)
        .addConnectedMethodName(methodName);
}


export const disconnectedCallbackNode = <T extends object>() => (componentClass: T, methodName: PropertyKey): void => {
    componentReflection.getComponentConfiguration(componentClass)
        .addDisconnectedNodeMethodName(methodName);
}

export const disconnectedCallback = <T extends object>() => (componentClass: T, methodName: PropertyKey): void => {
    componentReflection.getComponentConfiguration(componentClass)
        .addDisconnectedMethodName(methodName);
}

class ComponentLifecycle <T extends RenderableComponent> {
    private connectedCount = 0;
    constructor(
        private readonly instance: T, private readonly componentConfiguration: ComponentConfiguration) {
    }

    connectedCallbackNode(element: HTMLElement): void {
        this.connectedCount++;
        if (this.connectedCount === 1) {
            this.componentConfiguration.connectedCallback(this.instance);
        }

        this.componentConfiguration.connectedCallbackNode(this.instance, element);
    }

    disconnectedCallbackNode(element: HTMLElement): void {
        this.connectedCount--;
        this.componentConfiguration.disconnectedNodeCallback(this.instance, element);

        if (this.connectedCount === 0) {
            this.componentConfiguration.disconnectedCallback(this.instance);
        }
    }
}

export const pureComponent = <T extends RenderableComponent>() => (componentClass: Constructor<T>): void => {
    componentReflection.markAsComponent(componentClass);
    const componentClassWithSideEffects = observable()(componentClass);

    onConstruct(componentClassWithSideEffects, (instance: T) => {
        instance[componentLifecycleSymbol] =
            new ComponentLifecycle(instance, componentReflection.getComponentConfiguration(instance));
    });

    return componentClassWithSideEffects;
};

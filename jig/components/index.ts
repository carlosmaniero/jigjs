import {html as templateHtml, HTMLElementWithJigProperties, render, Renderable} from '../template/render';
import {observable, observe, onConstruct} from '../reactive';
import {Subscription} from '../events/subject';
import {Constructor} from '../types';

const componentLifecycleSymbol = Symbol('component-lifecycle-symbol');
const elementComponentInstance = Symbol('component-instance');

const getComponentLifecycle = <T extends RenderableComponent>(component: T): ComponentLifecycle<T> => {
  return component[componentLifecycleSymbol];
};

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
  },
};

class RenderRacing {
  private willRender = false;

  render(componentInstance: RenderableComponent, elements: HTMLElement[]): void {
    if (this.willRender) {
      return;
    }

    this.willRender = true;

    Promise.resolve().then(() => {
      elements.forEach((element) => {
        if (!this.isElementControlledByThisInstance(element, componentInstance)) {
          return;
        }

        this.willRender = false;
        render(componentInstance.render())(element);
      });
    });
  }

  private isElementControlledByThisInstance(element: HTMLElement, componentInstance: RenderableComponent): boolean {
    return element[elementComponentInstance] === componentInstance;
  }
}

export const renderComponent = (element: HTMLElementWithJigProperties, component: RenderableComponent, selfControlled = false): void => {
  const componentElement: HTMLElementWithJigProperties = element.ownerDocument.createElement(component.constructor.name);
  componentElement[elementComponentInstance] = component;

  componentElement.bindPreExisting = (from): void => {
    from[elementComponentInstance] = component;
    getComponentLifecycle(componentElement[elementComponentInstance])
        .connectedCallbackNode(from);
  };

  componentElement.shouldUpdate = (to): boolean => {
    if (componentElement[elementComponentInstance] !== to[elementComponentInstance]) {
      componentElement['onDisconnect']();
      component[elementComponentInstance] = to[elementComponentInstance];
      componentElement['onConnect']();
    }
    return true;
  };
  componentElement.shouldReplace = (from): boolean => {
    return componentElement[elementComponentInstance] !== from[elementComponentInstance];
  };
  componentElement.onDisconnect = (): void => {
    getComponentLifecycle(componentElement[elementComponentInstance])
        .disconnectedCallbackNode(componentElement);
  };
  componentElement.onConnect = (): void => {
    getComponentLifecycle(componentElement[elementComponentInstance])
        .connectedCallbackNode(componentElement);
  };

  if (selfControlled) {
    componentElement.isSelfControlled = true;
    componentElement.selfControlledInitialRender = (from) => {
      render(from[elementComponentInstance].render())(componentElement);
    };

    render(componentElement)(element);
    return;
  }

  render(component.render())(componentElement);
  render(componentElement)(element);
};

const renderComponentOrValue = (valueOrComponent: object | object[] | RenderableComponent): Renderable | Renderable[] => {
  if (Array.isArray(valueOrComponent)) {
    return valueOrComponent.map(renderComponentOrValue) as Renderable[];
  }

  if (componentReflection.isComponent(valueOrComponent)) {
    return {
      renderAt(document): DocumentFragment {
        const fragment = document.createDocumentFragment();
        renderComponent(fragment, valueOrComponent, true);
        return fragment;
      },
    };
  }

  return valueOrComponent as Renderable;
};

export const html = (template: TemplateStringsArray, ...values: unknown[]): Renderable => {
  const transformTemplateValues = values.map((value: object) => {
    return renderComponentOrValue(value);
  });
  return templateHtml(template, ...transformTemplateValues);
};

export interface RenderableComponent {
  render(): Renderable;
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
    });
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
};

export const connectedCallback = <T extends object>() => (componentClass: T, methodName: PropertyKey): void => {
  componentReflection.getComponentConfiguration(componentClass)
      .addConnectedMethodName(methodName);
};


export const disconnectedCallbackNode = <T extends object>() => (componentClass: T, methodName: PropertyKey): void => {
  componentReflection.getComponentConfiguration(componentClass)
      .addDisconnectedNodeMethodName(methodName);
};

export const disconnectedCallback = <T extends object>() => (componentClass: T, methodName: PropertyKey): void => {
  componentReflection.getComponentConfiguration(componentClass)
      .addDisconnectedMethodName(methodName);
};

class ComponentLifecycle<T extends RenderableComponent> {
  private connectedElements: HTMLElement[] = [];
  private subscription: Subscription;
  private renderRace: RenderRacing;

  constructor(
      private readonly instance: T,
      private readonly componentConfiguration: ComponentConfiguration) {
    this.renderRace = new RenderRacing();
  }

  connectedCallbackNode(element: HTMLElement): void {
    this.connectedElements.push(element);

    if (this.connectedElements.length === 1) {
      this.watchSideEffects();
      this.componentConfiguration.connectedCallback(this.instance);
    }

    this.componentConfiguration.connectedCallbackNode(this.instance, element);
  }

  disconnectedCallbackNode(element: HTMLElement): void {
    this.connectedElements = this.connectedElements
        .filter((connectedElement) => connectedElement !== element);

    this.componentConfiguration.disconnectedNodeCallback(this.instance, element);

    if (this.connectedElements.length === 0) {
      this.stopWatchingSideEffects();
      this.componentConfiguration.disconnectedCallback(this.instance);
    }
  }

  private watchSideEffects() {
    this.subscription = observe(this.instance, () => {
      this.renderRace.render(this.instance, this.connectedElements);
    });
  }

  private stopWatchingSideEffects(): void {
    this.subscription && this.subscription.unsubscribe();
    this.subscription = undefined;
  }
}

export const component = <T extends RenderableComponent>() => (componentClass: Constructor<T>): void => {
  componentReflection.markAsComponent(componentClass);
  const componentClassWithSideEffects = observable()(componentClass);

  onConstruct(componentClassWithSideEffects, (instance: T) => {
    instance[componentLifecycleSymbol] =
        new ComponentLifecycle(instance, componentReflection.getComponentConfiguration(instance));
  });

  return componentClassWithSideEffects;
};

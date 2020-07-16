import {html as templateHtml, HTMLElementWithJigProperties, render, Renderable} from '../template/render';
import {observable, observe, onConstruct} from '../reactive';
import {Subscription} from '../events/subject';
import {Constructor} from '../types';

const componentLifecycleSymbol = '####jig-component-lifecycle-symbol####';
const elementComponentInstance = '####jig-component-instance####';

const getComponentLifecycle = <T extends RenderableComponent>(component: T): ComponentLifecycle<T> => {
  return component[componentLifecycleSymbol];
};

const componentReflection = {
  isComponentSymbol: '####jig-is-component####',
  lifecycleProperty: '####jig-component-lifecycle####',
  markAsComponent<T extends RenderableComponent>(componentClass: Constructor<T>): void {
    componentClass[this.isComponentSymbol] = true;
  },
  defineComponentLifecycle<T extends RenderableComponent>(componentClass: Constructor<T>, componentLifeCycle: ComponentConfiguration): void {
    componentClass[this.lifecycleProperty] = componentLifeCycle;
  },
  getComponentConfiguration(component: object): ComponentConfiguration {
    const componentLifecycle: ComponentConfiguration =
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        component.constructor[this.lifecycleProperty] || new ComponentConfiguration();
    this.defineComponentLifecycle(component.constructor, componentLifecycle);

    return componentLifecycle;
  },
  isComponent(component: object): component is RenderableComponent {
    if (!component) {
      return;
    }
    return !!component.constructor[this.isComponentSymbol];
  },
};

class RenderRacing {
  private willRender = false;

  render(componentInstance: RenderableComponent, elementsCallback: () => HTMLElement[]): void {
    if (this.willRender) {
      return;
    }

    this.willRender = true;

    Promise.resolve().then(() => {
      this.willRender = false;
      elementsCallback().forEach((element) => {
        render(componentInstance.render())(element);
      });
    });
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
      this.renderRace.render(this.instance, () => this.connectedElements);
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
    Object.defineProperty(instance, componentLifecycleSymbol, {
      enumerable: false,
      writable: false,
      value: new ComponentLifecycle(instance, componentReflection.getComponentConfiguration(instance)),
    });
  });

  return componentClassWithSideEffects;
};

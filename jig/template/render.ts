import morphdom from 'morphdom';

const createPlaceholderForIndex = (valueIndex: number): string =>
  `__render_placeholder_${valueIndex}_render_placeholder__`;

const NODES = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
};

export interface HtmlTemplate {
  renderAt: (document) => DocumentFragment;
}

export type Renderable = HtmlTemplate | ChildNode | DocumentFragment;

const placeHolderRegex = (): RegExp => /(__render_placeholder_)(\d+)(_render_placeholder__)/g;
const customPropertySyntaxSugarAttributeRegex = (): RegExp => /([/@](\w+)[ ]*[=])/g;
const customPropertySyntaxSugarAttributeGroup = '$2';
const customPropertyAttributePrefix = 'jig-custom-property-';

const isElement = (element: Node): element is HTMLElement => element.nodeType === NODES.ELEMENT_NODE;
const isTextNode = (element: Node): boolean => element.nodeType === NODES.TEXT_NODE;
const isPlaceHolder = (value: string): boolean => placeHolderRegex().test(value);
const isHtmlTemplate = (value: unknown): value is HtmlTemplate => typeof value === 'object' && 'renderAt' in value;

export const createTemplateElement = (document: Document): HTMLTemplateElement => {
  return document.createElement('template');
};

type LazyRunWithDocument<T> = {
  jigLazyRun: (document: Document) => T
}

export const lazyEvaluation = <T>(callback: (document: Document) => T): LazyRunWithDocument<T> => ({
  jigLazyRun: (document) => callback(document),
});

const isLazyEvaluation = <T>(value: unknown): value is LazyRunWithDocument<T> => {
  return value && typeof value === 'object' && !!(value as Record<string, unknown>).jigLazyRun;
};

const evaluate = <T>(document: Document, value: unknown): T => {
  if (isLazyEvaluation<T>(value)) {
    return value.jigLazyRun(document);
  }

  return value as T;
};

const cloneActualElementFromFragment = (bindElement: Node & ParentNode, documentFragment: DocumentFragment): Node & ParentNode => {
  const cloneTemplate = createTemplateElement(bindElement.ownerDocument);
  const tagName = (bindElement as HTMLElement).tagName;

  let clone: Node & ParentNode = cloneTemplate.content;

  if (tagName && tagName !== 'BODY') {
    cloneTemplate.innerHTML = `<${tagName}></${tagName}>`;
    clone = cloneTemplate.content.childNodes[0] as HTMLElement;
  }

  const content = documentFragment;

  while (content.childNodes.length !== 0) {
    clone.appendChild(content.childNodes[0]);
  }
  return clone;
};

export type HTMLElementWithJigProperties = HTMLElement & {
  shouldUpdate?: (to: HTMLElement) => boolean;
  shouldReplace?: (to: HTMLElement) => boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  selfControlledInitialRender?: (from: HTMLElement) => void;
  bindPreExisting?: (from: HTMLElement) => void;
  events?: Record<string, (event: Event) => void>;
  isSelfControlled?: boolean;
  disconnectingFromDocument?: boolean;
  alreadyConnected?: boolean;
}

const bindEvents = (from: HTMLElementWithJigProperties, to: HTMLElementWithJigProperties): void => {
  const events = to.events;
  if (events) {
    const fromEvents = from.events || {};

    Object.keys(events)
        .forEach((event) => {
          if (fromEvents[event]) {
            from.removeEventListener(event, fromEvents[event]);
          }
          from.addEventListener(event, events[event]);
          fromEvents[event] = events[event];
        });

    from.events = fromEvents;
  }
};

const attachedToDocument = (node: HTMLElementWithJigProperties): boolean => {
  return node.ownerDocument.contains(node);
};

const connectPreExisting = (from: HTMLElementWithJigProperties, to: HTMLElementWithJigProperties): void => {
  if (!attachedToDocument(from) || from.alreadyConnected) {
    return;
  }

  from.alreadyConnected = true;

  if (to.bindPreExisting) {
    to.bindPreExisting(from);
  }
};

const applyToDom = (bindElement: Node & ParentNode, clone: Node & ParentNode): void => {
  bindElement.normalize();
  clone.normalize();

  function onNodeDiscarded(node: HTMLElementWithJigProperties) {
    if (node.disconnectingFromDocument && node.onDisconnect) {
      node.onDisconnect();
    }
  }

  function onBeforeNodeDiscarded(node: HTMLElementWithJigProperties) {
    if (attachedToDocument(node)) {
      node.disconnectingFromDocument = true;
      node.querySelectorAll && node.querySelectorAll('*').forEach((el: HTMLElementWithJigProperties) => {
        el.disconnectingFromDocument = true;
      });
    }
  }

  function onNodeAdded(node: HTMLElementWithJigProperties) {
    if (attachedToDocument(node) && node.onConnect) {
      node.onConnect();
      node.alreadyConnected = true;

      if (node.isSelfControlled) {
        node.selfControlledInitialRender(node);
      }
    }
  }

  morphdom(bindElement, clone, {
    childrenOnly: true,
    onNodeAdded(node: HTMLElementWithJigProperties) {
      onNodeAdded(node);

      return node;
    },
    onNodeDiscarded(node: HTMLElementWithJigProperties) {
      onNodeDiscarded(node);
    },
    onBeforeNodeDiscarded(node: HTMLElementWithJigProperties) {
      onBeforeNodeDiscarded(node);
      return true;
    },
    onBeforeElUpdated: (from: HTMLElementWithJigProperties, to: HTMLElementWithJigProperties) => {
      if (from.alreadyConnected && to.shouldReplace && to.shouldReplace(from)) {
        onBeforeNodeDiscarded(from);
        onNodeDiscarded(from);
        from.replaceWith(to);
        onNodeAdded(to);
        return false;
      }

      if (from.alreadyConnected && to.isSelfControlled) {
        return false;
      }

      bindEvents(from, to);
      connectPreExisting(from, to);

      if (from.shouldUpdate) {
        return from.shouldUpdate(to);
      }

      return true;
    },
  });
};

export const render = (renderable: Renderable) =>
  (bindElement: Node & ParentNode): void => {
    if (renderable !== undefined && 'renderAt' in renderable) {
      const clone = cloneActualElementFromFragment(bindElement, renderable.renderAt(bindElement.ownerDocument));
      applyToDom(bindElement, clone);
      return;
    }

    const clone = cloneActualElementFromFragment(bindElement, bindElement.ownerDocument.createDocumentFragment());
    renderable && clone.appendChild(renderable as HTMLElement);
    applyToDom(bindElement, clone);
  };

const hasPlaceHolder = (text: string): boolean => {
  return text.indexOf('__render_placeholder_') >= 0 && text.indexOf('_render_placeholder__') >= 0;
};

const getPlaceHolderIndex = (placeholder: string): number[] => {
  if (!isPlaceHolder(placeholder)) {
    return null;
  }
  return placeholder.match(placeHolderRegex())
      .map((mathPlaceholder) =>
        parseInt(mathPlaceholder.match(/(__render_placeholder_)(\d+)(_render_placeholder__)/)[2]));
};

const createElementChildNodesForValue = (document, value: unknown): ChildNode[] => {
  if (value === undefined || value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((val) => createElementChildNodesForValue(document, val));
  }

  if (isHtmlTemplate(value)) {
    return Array.from(value.renderAt(document).childNodes);
  }

  return [document.createTextNode(evaluate(document, value).toString())];
};

const fillChildNodesContentPlaceholder = (content: DocumentFragment | ChildNode, values: unknown[]): void => {
  Array.from(content.childNodes).forEach((element) => {
    const document = element.ownerDocument;
    const parent = content;
    if (isTextNode(element)) {
      let textContent = element.textContent;
      const placeholderIndexes = getPlaceHolderIndex(textContent);

      if (!placeholderIndexes || placeholderIndexes.length === 0) {
        return;
      }

      for (const placeholderIndex of placeholderIndexes) {
        const placeholder = createPlaceholderForIndex(placeholderIndex);

        const [beforePlaceholder, afterPlaceholder] = textContent.split(placeholder);

        beforePlaceholder && parent.insertBefore(document.createTextNode(beforePlaceholder), element);

        Array.from(createElementChildNodesForValue(document, values[placeholderIndex]))
            .forEach((child) => {
              parent.insertBefore(child, element);
            });

        textContent = afterPlaceholder;
      }

      textContent && parent.insertBefore(document.createTextNode(textContent), element);
      element.remove();
    }
    fillChildNodesContentPlaceholder(element, values);
  });
};

interface AttributeHandlerProps {
  attributeName: string;
  element: HTMLElementWithJigProperties;
  values: unknown[];
}

interface AttributeHandler {
  isHandlerOf: (element: HTMLElement, attributeName: string) => boolean;
  handle: (props: AttributeHandlerProps) => void;
}

const bindElementEvent = (attributeName: string, element: HTMLElementWithJigProperties, value: () => void) => {
  const event = attributeName.replace('on', '') as keyof HTMLElementEventMap;

  const evaluatedValue = evaluate<() => void>(element.ownerDocument, value);

  element.events = element.events || {};
  element.events[event] = evaluatedValue;

  element.addEventListener(event, evaluatedValue);
  element.removeAttribute(attributeName);
};

const eventAttributeHandler = {
  handle(props: AttributeHandlerProps): void {
    const {attributeName, element, values}: AttributeHandlerProps = props;
    const originalAttribute = element.getAttribute(attributeName);
    const placeHolderIndex = getPlaceHolderIndex(originalAttribute)[0];
    const placeholder = createPlaceholderForIndex(placeHolderIndex);
    const value = values[placeHolderIndex] as () => void;

    this.validate(originalAttribute, placeholder, attributeName, value);

    bindElementEvent(attributeName, element, value);
  },
  isHandlerOf(element: HTMLElement, attributeName: string): boolean {
    return attributeName.startsWith('on');
  },
  validate(originalAttribute: string, placeholder: string, attributeName, value: unknown): void {
    if (isLazyEvaluation(value)) {
      return;
    }
    if (originalAttribute !== placeholder) {
      throw new Error(`${attributeName} must be a function it was "${originalAttribute.replace(placeholder, '[function]')}"`);
    }

    if (typeof value != 'function') {
      throw new Error(`${attributeName} must be a function it was "${typeof value}"`);
    }
  },
};

const commonAttributeHandler = {
  handle(props: AttributeHandlerProps): void {
    const {attributeName, element, values}: AttributeHandlerProps = props;
    const originalAttribute = element.getAttribute(attributeName);
    const placeHolderIndexes = getPlaceHolderIndex(originalAttribute);

    let attributeToAdd = originalAttribute;

    placeHolderIndexes.forEach((placeholderIndex) => {
      const value = evaluate(props.element.ownerDocument, values[placeholderIndex]);
      const placeholder = createPlaceholderForIndex(placeholderIndex);
      attributeToAdd = attributeToAdd.replace(placeholder, value as string);
    });

    element.setAttribute(attributeName, attributeToAdd);
  },
  isHandlerOf(element: HTMLElement, attributeName: string): boolean {
    return hasPlaceHolder(element.getAttribute(attributeName));
  },
};

const attributeMapHandler = {
  handle(props: AttributeHandlerProps): void {
    props.element.removeAttribute(props.attributeName);

    getPlaceHolderIndex(props.attributeName).forEach((placeholderIndex) => {
      const attributeMap = props.values[placeholderIndex] as Record<string, unknown>;

      for (const attributeName in attributeMap) {
        if (attributeMap.hasOwnProperty(attributeName)) {
          if (attributeName.startsWith('on')) {
            bindElementEvent(attributeName, props.element, attributeMap[attributeName] as () => void);
          } else {
            props.element.setAttribute(attributeName, evaluate<string>(props.element.ownerDocument, attributeMap[attributeName]));
          }
        }
      }
    });
  },
  isHandlerOf(_element: HTMLElement, attributeName: string): boolean {
    return isPlaceHolder(attributeName);
  },
};
const attributeHandlers: AttributeHandler[] = [
  eventAttributeHandler,
  commonAttributeHandler,
  attributeMapHandler,
];

const applyAttributeTransformation = (props: AttributeHandlerProps) => {
  const handler = attributeHandlers
      .find((handler) => handler.isHandlerOf(props.element, props.attributeName));

  if (handler) {
    handler.handle(props);
  }
};

const fillAttributes = (element: DocumentFragment | ChildNode, values: unknown[]): void => {
  if (isElement(element)) {
    const attributes = element.getAttributeNames();

    attributes.forEach((attributeName) => {
      applyAttributeTransformation({element, attributeName, values});
    });
  }

  element.childNodes.forEach((child) => fillAttributes(child, values));
};

const fillPlaceholders = (content: DocumentFragment, values: unknown[]): void => {
  fillChildNodesContentPlaceholder(content, values);
  fillAttributes(content, values);
};

const replaceCustomPropsSyntaxSugar = (partialTemplate: string): string => {
  return partialTemplate.replace(customPropertySyntaxSugarAttributeRegex(), `${customPropertyAttributePrefix + customPropertySyntaxSugarAttributeGroup}=`);
};

const createTemplateWithPlaceholders = (template: TemplateStringsArray, values: unknown[]): string => {
  return template.map(
      (partialTemplate, index) => {
        const valuePlaceholder = index >= values.length ? '' : createPlaceholderForIndex(index);
        return `${(replaceCustomPropsSyntaxSugar(partialTemplate))}${valuePlaceholder}`;
      }).join('');
};

export const html = (template: TemplateStringsArray, ...values: unknown[]): Renderable => {
  return {
    renderAt: (document): DocumentFragment => {
      const templateElement: HTMLTemplateElement = createTemplateElement(document);
      templateElement.innerHTML = createTemplateWithPlaceholders(template, values);

      const content = document.createDocumentFragment();
      content.appendChild(templateElement.content);

      fillPlaceholders(content, values);
      return content;
    },
  };
};

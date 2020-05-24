import morphdom from "morphdom";

const createPlaceholderForIndex = (valueIndex: number): string =>
    `__render_placeholder_${valueIndex}_render_placeholder__`

const NODES = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3,
}

export interface HtmlTemplate {
    renderAt: (element: Node & ParentNode) => DocumentFragment;
}

export type Renderable = HtmlTemplate | ChildNode;

const placeHolderRegex = /(__render_placeholder_)(\d+)(_render_placeholder__)/g;
const customPropertySyntaxSugerAttributeRegex = /([/@](\w+)[ ]*[=])/g;
const customPropertySyntaxSugarAttributeGroup = '$2';
const customPropertyAttributePrefix = 'jig-custom-property-';

const isCustomProperty = (attributeName: string) => attributeName.startsWith(customPropertyAttributePrefix);
const isElement = (element: Node): element is HTMLElement => element.nodeType === NODES.ELEMENT_NODE;
const isTextNode = (element: Node) => element.nodeType === NODES.TEXT_NODE;
const isPlaceHolder = (value: string): boolean => placeHolderRegex.test(value);

function cloneActualElementFromFragment(bindElement: Node & ParentNode, documentFragment: DocumentFragment) {
    const clone: HTMLElement = bindElement.cloneNode() as HTMLElement;
    clone.innerHTML = '';

    const content = documentFragment;

    while (content.childNodes.length !== 0) {
        clone.appendChild(content.childNodes[0]);
    }
    return clone;
}

type HTMLElementWithJigProperties = HTMLElement & {
    shouldUpdate?: (to: HTMLElement) => boolean;
    events: Record<string, (event: Event) => void>;
    props: Record<string, unknown>;
}

const bindEvents = (from: HTMLElementWithJigProperties, to: HTMLElementWithJigProperties) => {
    const events = to.events;
    if (events) {
        const fromEvents = from.events || {};

        Object.keys(events)
            .forEach((event) => {
                if (fromEvents[event]) {
                    from.removeEventListener(event, fromEvents[event]);
                }
                from.addEventListener(event, events[event])
                fromEvents[event] = events[event];
            });

        from.events = fromEvents;
    }
}

const bindProps = (from: HTMLElementWithJigProperties, to: HTMLElementWithJigProperties): void => {
    from.props = to.props;
}

const applyToDom = (bindElement: Node & ParentNode, clone: HTMLElement): void => {
    morphdom(bindElement, clone, {
        childrenOnly: true,
        onBeforeElUpdated: (from: HTMLElementWithJigProperties, to: HTMLElementWithJigProperties) => {
            if (from.shouldUpdate) {
                return from.shouldUpdate(to);
            }

            bindEvents(from, to);
            bindProps(from, to);

            return true;
        }
    });
}

export const render = (renderable: Renderable) =>
    (bindElement: Node & ParentNode): void => {
        if (renderable !== undefined && 'renderAt' in renderable) {
            const clone = cloneActualElementFromFragment(bindElement, renderable.renderAt(bindElement));
            applyToDom(bindElement, clone);
            return;
        }

        const clone = cloneActualElementFromFragment(bindElement, bindElement.ownerDocument.createDocumentFragment());
        renderable && clone.appendChild(renderable as HTMLElement);
        applyToDom(bindElement, clone);
    }

const hasPlaceHolder = (text: string): boolean => {
    return text.indexOf('__render_placeholder_') >= 0 && text.indexOf('_render_placeholder__') >= 0;
}

const getPlaceHolderIndex = (placeholder: string): number[] => {
    if (!isPlaceHolder(placeholder)) {
        return null;
    }
    return placeholder.match(placeHolderRegex)
        .map((mathPlaceholder) =>
            parseInt(mathPlaceholder.match(/(__render_placeholder_)(\d+)(_render_placeholder__)/)[2]));
}

const fillArrayElementContent = (element: ChildNode, placeholder: string, value): void => {
    const document = element.ownerDocument;
    const texts = element.textContent.split(placeholder);
    element.textContent = '';

    texts.forEach((text, index) => {
        element.parentElement.appendChild(
            document.createTextNode(text));

        if (index == 0) {
            value.forEach((child) => {

                if (child.renderAt) {
                    const fragment = document.createDocumentFragment();

                    render(child)(fragment);

                    while(fragment.childNodes.length !== 0) {
                        element.parentElement.appendChild(fragment.childNodes[0]);
                    }

                    return;
                }

                element.parentElement.appendChild(document.createTextNode(child));
            });
        }
    });
}

const fillContentPlaceholder = (content: DocumentFragment | ChildNode, values: unknown[]): void => {
    content.childNodes.forEach((element) => {
        if (isTextNode(element)) {
            values.forEach((value, i) => {
                const placeholder = createPlaceholderForIndex(i);

                if (element.textContent.indexOf(placeholder) >= 0 && Array.isArray(value)) {
                    fillArrayElementContent(element, placeholder, value);

                    return
                }

                element.textContent = element.textContent.replace(placeholder, value as string);
            });
            return;
        }
        fillContentPlaceholder(element, values);
    });
}

interface AttributeHandlerProps {
    attributeName: string;
    element: HTMLElement;
    values: unknown[];
}

interface AttributeHandler {
    isHandlerOf: (element: HTMLElement, attributeName: string) => boolean;
    handle: (props: AttributeHandlerProps) => void;
}

const customPropertyHandler: AttributeHandler = {
    handle(props: AttributeHandlerProps): void {
        const {attributeName, element, values}: AttributeHandlerProps = props;
        const originalAttribute = element.getAttribute(attributeName);
        const propsKey = attributeName.replace(customPropertyAttributePrefix, '');

        (element as any).props = (element as any).props || {};

        const placeHolderIndexes = getPlaceHolderIndex(originalAttribute) || [];

        if (placeHolderIndexes.length === 1) {
            const placeHolderIndex = placeHolderIndexes[0];
            const placeholder = createPlaceholderForIndex(placeHolderIndex);
            const value = values[placeHolderIndex];


            if (originalAttribute === placeholder) {
                (element as any).props[propsKey] = value;
            } else {
                (element as any).props[propsKey] =
                    originalAttribute.replace(placeholder, value as string);
            }

            element.removeAttribute(attributeName);

            return;
        }

        let attributeToAdd = originalAttribute;

        placeHolderIndexes.forEach((placeholderIndex) => {
            const value = values[placeholderIndex];
            const placeholder = createPlaceholderForIndex(placeholderIndex);
            attributeToAdd = attributeToAdd.replace(placeholder, value as string)
        });

        (element as any).props[propsKey] = attributeToAdd;
        element.removeAttribute(attributeName);
    },
    isHandlerOf(element: HTMLElement, attributeName: string): boolean {
        return isCustomProperty(attributeName);
    }
}

const eventAttributeHandler = {
    handle(props: AttributeHandlerProps): void {
        const {attributeName, element, values}: AttributeHandlerProps = props;
        const originalAttribute = element.getAttribute(attributeName);
        const placeHolderIndex = getPlaceHolderIndex(originalAttribute)[0];
        const placeholder = createPlaceholderForIndex(placeHolderIndex);
        const value = values[placeHolderIndex];

        this.validate(originalAttribute, placeholder, attributeName, value);

        const event = attributeName.replace('on', '') as keyof HTMLElementEventMap;

        (element as any).events = (element as any).events || {};
        (element as any).events[event] = value;

        element.addEventListener(event, value as () => void);
        element.removeAttribute(attributeName);
    },
    isHandlerOf(element: HTMLElement, attributeName: string): boolean {
        return attributeName.startsWith('on');
    },
    validate(originalAttribute: string, placeholder: string, attributeName, value: unknown): void {
        if (originalAttribute !== placeholder) {
            throw new Error(`${attributeName} must be a function it was "${originalAttribute.replace(placeholder, '[function]')}"`);
        }

        if (typeof value != "function") {
            throw new Error(`${attributeName} must be a function it was "${typeof value}"`);
        }
    }
}

const commonAttributeHandler = {
    handle(props: AttributeHandlerProps): void {
        const {attributeName, element, values}: AttributeHandlerProps = props;
        const originalAttribute = element.getAttribute(attributeName);
        const placeHolderIndexes = getPlaceHolderIndex(originalAttribute);

        let attributeToAdd = originalAttribute;

        placeHolderIndexes.forEach((placeholderIndex) => {
            const value = values[placeholderIndex];
            const placeholder = createPlaceholderForIndex(placeholderIndex);
            attributeToAdd = attributeToAdd.replace(placeholder, value as string)
        })

        element.setAttribute(attributeName, attributeToAdd);
    },
    isHandlerOf(element: HTMLElement, attributeName: string): boolean {
        return hasPlaceHolder(element.getAttribute(attributeName));
    }

}

const attributeHandlers: AttributeHandler[] = [
    customPropertyHandler,
    eventAttributeHandler,
    commonAttributeHandler
]

const fillAttributes = (element: DocumentFragment | ChildNode, values: unknown[]) => {
    if (isElement(element)) {
        const attributes = element.getAttributeNames();

        attributes.forEach((attributeName) => {
            const handler = attributeHandlers
                .find((handler) => handler.isHandlerOf(element, attributeName));

            if (handler) {
                handler.handle({
                    element,
                    attributeName,
                    values
                });
            }
        });
    }

    element.childNodes.forEach((child) => fillAttributes(child, values));
}

const fillPlaceholders = (content: DocumentFragment, values: unknown[]): void => {
    fillContentPlaceholder(content, values);
    fillAttributes(content, values);
}

const replaceCustomPropsSyntaxSugar = (partialTemplate: string): string => {
    return partialTemplate.replace(customPropertySyntaxSugerAttributeRegex, `${customPropertyAttributePrefix + customPropertySyntaxSugarAttributeGroup}=`);
}

const createTemplateWithPlaceholders = (template: TemplateStringsArray, values: unknown[]) => {
    return template.map(
        (partialTemplate, index) => {
            const valuePlaceholder = index >= values.length ? '' : createPlaceholderForIndex(index);
            return `${(replaceCustomPropsSyntaxSugar(partialTemplate))}${valuePlaceholder}`;
        }).join('');
}

export const createTemplateElement = (document: Document): HTMLTemplateElement => {
    return document.createElementNS('http://www.w3.org/1999/xhtml', 'template') as HTMLTemplateElement;
}

export const html = (template: TemplateStringsArray, ...values: unknown[]): Renderable => {
    return {
        renderAt: (element): DocumentFragment => {
            const document = element.ownerDocument;
            const templateElement: HTMLTemplateElement = createTemplateElement(document);
            templateElement.innerHTML = createTemplateWithPlaceholders(template, values);
            const content = templateElement.content;
            fillPlaceholders(content, values);
            return content;
        }
    }
}

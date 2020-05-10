const createPlaceholderForIndex = (valueIndex: number) => `__render_placeholder_${valueIndex}_render_placeholder__`

const NODES = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3,
}

interface Renderable {
    renderAt: (element: HTMLElement) => DocumentFragment
}

const isElement = (element: Node): element is HTMLElement => element.nodeType === NODES.ELEMENT_NODE;
const isTextNode = (element: Node) => element.nodeType === NODES.TEXT_NODE;

const customPropertySyntaxSugerAttributeRegex = /([/@](\w+)[ ]*[=])/g;
const customPropertySyntaxSugarAttributeGroup = '$2';
const customPropertyAttributePrefix = 'jigjoy-custom-property-';

const isCustomProperty = (attributeName: string) => attributeName.startsWith(customPropertyAttributePrefix);

function hasPlaceHolder(text: string) {
    return text.indexOf('__render_placeholder_') >= 0 && text.indexOf('_render_placeholder__') >= 0;
}

function getPlaceHolderIndex(placeholder: string): number[] {
    return placeholder.match(/(__render_placeholder_)(\d+)(_render_placeholder__)/g)
        .map((mathPlaceholder) =>
            parseInt(mathPlaceholder.match(/(__render_placeholder_)(\d+)(_render_placeholder__)/)[2]));
}

function fillArrayElementContent(element: ChildNode, placeholder: string, value) {
    const document = element.ownerDocument;
    const texts = element.textContent.split(placeholder);
    element.textContent = '';

    texts.forEach((text, index) => {
        element.parentElement.appendChild(
            document.createTextNode(text));

        if (index == 0) {
            value.forEach((child) => {
                if (child.renderAt) {
                    render(child)(element.parentElement, false);
                    return;
                }

                element.parentElement.appendChild(document.createTextNode(child));
            });
        }
    });
}

function fillContentPlaceholder(content: DocumentFragment | ChildNode, values: any[]) {
    content.childNodes.forEach((element) => {
        if (isTextNode(element)) {
            values.forEach((value, i) => {
                const placeholder = createPlaceholderForIndex(i);

                if (element.textContent.indexOf(placeholder) >= 0 && Array.isArray(value)) {
                    fillArrayElementContent(element, placeholder, value);

                    return
                }

                element.textContent = element.textContent.replace(placeholder, value);
            });
            return;
        }
        fillContentPlaceholder(element, values);
    });
}

interface AttributeHandlerProps {
    attributeName: string;
    element: HTMLElement;
    values: any[]
}

interface AttributeHandler {
    isHandlerOf: (element: HTMLElement, attributeName: string) => boolean;
    handle: (props: AttributeHandlerProps) => void;
}

const customPropertyHandler: AttributeHandler = {
    handle(props: AttributeHandlerProps): void {
        let {attributeName, element, values}: AttributeHandlerProps = props;
        const originalAttribute = element.getAttribute(attributeName);
        const placeHolderIndexes = getPlaceHolderIndex(originalAttribute);
        const propsKey = attributeName.replace(customPropertyAttributePrefix, '');

        (element as any).props = (element as any).props || {};

        if (placeHolderIndexes.length === 1) {
            const placeHolderIndex = placeHolderIndexes[0];
            const placeholder = createPlaceholderForIndex(placeHolderIndex);
            const value = values[placeHolderIndex];


            if (originalAttribute === placeholder) {
                (element as any).props[propsKey] = value;
            } else {
                (element as any).props[propsKey] =
                    originalAttribute.replace(placeholder, value);
            }

            element.removeAttribute(attributeName);

            return;
        }

        let attributeToAdd = originalAttribute;

        placeHolderIndexes.forEach((placeholderIndex) => {
            const value = values[placeholderIndex];
            const placeholder = createPlaceholderForIndex(placeholderIndex);
            attributeToAdd = attributeToAdd.replace(placeholder, value)
        });

        (element as any).props[propsKey] = attributeToAdd;
    },
    isHandlerOf(element: HTMLElement, attributeName: string): boolean {
        return isCustomProperty(attributeName);
    }
}

const eventAttributeHandler = {
    handle(props: AttributeHandlerProps): void {
        let {attributeName, element, values}: AttributeHandlerProps = props;
        const originalAttribute = element.getAttribute(attributeName);
        const placeHolderIndex = getPlaceHolderIndex(originalAttribute)[0];
        const placeholder = createPlaceholderForIndex(placeHolderIndex);
        const value = values[placeHolderIndex];

        this.validate(originalAttribute, placeholder, attributeName, value);

        const event = attributeName.replace('on', '');

        element.addEventListener(event, value);
        element.removeAttribute(attributeName);
    },
    isHandlerOf(element: HTMLElement, attributeName: string): boolean {
        return attributeName.startsWith('on');
    },
    validate(originalAttribute: string, placeholder: string, attributeName, value: any) {
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
            attributeToAdd = attributeToAdd.replace(placeholder, value)
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

function fillAttributes(element: DocumentFragment | ChildNode, values: any[]) {
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

function fillPlaceholders(content: DocumentFragment, values: any[]) {
    fillContentPlaceholder(content, values);
    fillAttributes(content, values);
}

function replaceCustomPropsSyntaxSugar(partialTemplate: string) {
    return partialTemplate.replace(customPropertySyntaxSugerAttributeRegex, `${customPropertyAttributePrefix + customPropertySyntaxSugarAttributeGroup}=`);
}

function createTemplateWithPlaceholders(template: TemplateStringsArray, values: any[]) {
    return template.map(
        (partialTemplate, index) => {
            const valuePlaceholder = index >= values.length ? '' : createPlaceholderForIndex(index);
            return `${(replaceCustomPropsSyntaxSugar(partialTemplate))}${valuePlaceholder}`;
        }).join('');
}

function createTemplateElement(document: Document) {
    return document.createElementNS('http://www.w3.org/1999/xhtml', 'template') as HTMLTemplateElement;
}

export const html = (template: TemplateStringsArray, ...values: any[]): Renderable => {
    return {
        renderAt: (element) => {
            const document = element.ownerDocument;
            const templateElement: HTMLTemplateElement = createTemplateElement(document);
            templateElement.innerHTML = createTemplateWithPlaceholders(template, values);
            const content = templateElement.content;
            fillPlaceholders(content, values);
            return content;
        }
    }
}

export const render = (renderable: Renderable) =>
    (bindElement: HTMLElement, clearPreviousContent: boolean = true) => {
    if (clearPreviousContent) {
        bindElement.innerHTML = '';
    }
    const content = renderable.renderAt(bindElement);

    while (content.childNodes.length !== 0) {
        bindElement.appendChild(content.childNodes[0]);
    }
}

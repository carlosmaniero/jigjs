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

function getPlaceHolderIndex(placeholder: string): number {
    return parseInt(placeholder.replace(/[^\d]/g, ''));
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

function setElementAttribute(attributeName: string, originalAttribute: string, element: HTMLElement, placeHolderIndex, value: any) {
    const placeholder = createPlaceholderForIndex(placeHolderIndex);

    if (attributeName.startsWith('on')) {
        if (originalAttribute !== placeholder) {
            throw new Error(`${attributeName} must be a function it was "${originalAttribute.replace(placeholder, '[function]')}"`);
        }

        if (typeof value != "function") {
            throw new Error(`${attributeName} must be a function it was "${typeof value}"`);
        }

        element.removeAttribute(attributeName);
        const event = attributeName.replace('on', '');
        element.addEventListener(event, value);

        return;
    }

    element.setAttribute(attributeName, originalAttribute.replace(placeholder, value));
}

function setElementCustomProperties(attributeName: string, element: HTMLElement, value, attribute: string, placeHolderIndex: number) {
    const placeholder = createPlaceholderForIndex(placeHolderIndex);
    (element as any).props = (element as any).props || {};

    if (attribute === placeholder) {
        (element as any).props[attributeName.replace(customPropertyAttributePrefix, '')] = value;
    } else {
        (element as any).props[attributeName.replace(customPropertyAttributePrefix, '')] =
            attribute.replace(placeholder, value);
    }

    element.removeAttribute(attributeName);
}

function fillAttributes(element: DocumentFragment | ChildNode, values: any[]) {
    if (isElement(element)) {
        const attributes = element.getAttributeNames();

        attributes.forEach((attributeName) => {
            const attribute = element.getAttribute(attributeName);
            const placeHolderIndex = getPlaceHolderIndex(attribute);
            const value = values[placeHolderIndex];

            if (isCustomProperty(attributeName)) {
                setElementCustomProperties(attributeName, element, value, attribute, placeHolderIndex);
                return;
            }

            if (hasPlaceHolder(attribute)) {
                setElementAttribute(attributeName, attribute, element, placeHolderIndex, value);
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

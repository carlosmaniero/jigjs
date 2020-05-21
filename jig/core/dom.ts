export const DocumentInjectionToken = "Document";
export const WindowInjectionToken = "Window";

interface DOM {
    HTMLElement: { prototype: HTMLElement; new(): HTMLElement };
    document: any;
    window: Window;
    body: HTMLElement;
    head: HTMLHeadElement;
    requestAnimationFrame: (callback) => void;
    serialize: () => string;
}

export const configureJSDOM = (data?: string): DOM => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jsdom = require('jsdom');
    const dom = new jsdom.JSDOM(data);

    const requestAnimationFrame = (callback): void => {
        setImmediate(callback);
    };

    (dom.window as any).requestAnimationFrame = requestAnimationFrame;

    return {
        HTMLElement: dom.window.HTMLElement,
        document: dom.window.document,
        window: dom.window,
        body: dom.window.document.body,
        head: dom.window.document.head,
        requestAnimationFrame,
        serialize: dom.serialize.bind(dom)
    };
}

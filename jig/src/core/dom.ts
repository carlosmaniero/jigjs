export const DocumentInjectionToken = "Document";
export const WindowInjectionToken = "Window";

export const configureJSDOM = (data?: string) => {
    const toRequire = (global as any).__non_webpack_require__ || require;

    const jsdom = toRequire('jsdom');
    const dom = new jsdom.JSDOM(data);

    const requestAnimationFrame = (callback) => setImmediate(callback);

    (dom.window as any).requestAnimationFrame = requestAnimationFrame;

    return {
        HTMLElement: dom.window.HTMLElement,
        document: dom.window.document,
        window: dom.window,
        requestAnimationFrame,
        serialize: dom.serialize.bind(dom)
    };
}

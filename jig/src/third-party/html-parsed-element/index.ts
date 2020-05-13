/*! (c) Andrea Giammarchi - ISC */
// https://github.com/WebReflection/html-parsed-element/blob/master/cjs/index.js
// With a small change to receive the window to perform document.addEventListener and custom elements registration
/* eslint-disable */
export const htmlParsedElementFactory = ((window) => {
    const DCL = 'DOMContentLoaded';
    const init = new WeakMap;
    const queue = [];
    const isParsed = el => {
        do {
            if (el.nextSibling)
                return true;
        } while (el = el.parentNode);
        return false;
    };
    const upgrade = () => {
        queue.splice(0).forEach(info => {
            if (init.get(info[0]) !== true) {
                init.set(info[0], true);
                info[0][info[1]]();
            }
        });
    };
    window.document.addEventListener(DCL, upgrade);

    class HTMLParsedElement extends window.HTMLElement {
        static withParsedCallback(Class, name = 'parsed') {
            const {prototype} = Class;
            const {connectedCallback} = prototype;
            const method = name + 'Callback';
            const cleanUp = (el, observer, ownerDocument, onDCL) => {
                observer.disconnect();
                ownerDocument.removeEventListener(DCL, onDCL);
                parsedCallback(el);
            };
            const parsedCallback = el => {
                if (!queue.length)
                    window.requestAnimationFrame(upgrade);
                queue.push([el, method]);
            };
            Object.defineProperties(
                prototype,
                {
                    connectedCallback: {
                        configurable: true,
                        value() {
                            if (connectedCallback)
                                connectedCallback.apply(this, arguments);
                            if (method in this && !init.has(this)) {
                                const self = this;
                                const {ownerDocument} = self;
                                init.set(self, false);
                                if (ownerDocument.readyState === 'complete' || isParsed(self))
                                    parsedCallback(self);
                                else {
                                    const onDCL = () => cleanUp(self, observer, ownerDocument, onDCL);
                                    ownerDocument.addEventListener(DCL, onDCL);
                                    const observer = new (window as any).MutationObserver(() => {
                                        /* istanbul ignore else */
                                        if (isParsed(self))
                                            cleanUp(self, observer, ownerDocument, onDCL);
                                    });
                                    observer.observe(self.parentNode, {childList: true, subtree: true});
                                }
                            }
                        }
                    },
                    [name]: {
                        configurable: true,
                        get() {
                            return init.get(this) === true;
                        }
                    }
                }
            );
            return Class;
        }
    }

    return HTMLParsedElement.withParsedCallback(HTMLParsedElement);
});

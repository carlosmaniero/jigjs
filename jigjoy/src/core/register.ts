import "reflect-metadata";

declare var global: any

if (typeof window === 'undefined') {
    const jsdom = require('jsdom');

    const globalDom = new jsdom.JSDOM();

    global.window = globalDom.window;
    global.document = globalDom.window.document;

}

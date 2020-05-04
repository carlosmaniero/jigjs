import "reflect-metadata";
import {DIContainer} from "./di";

export const ContainerInjectionToken = 'container'
declare var global: any

export const register = () => {
    if (typeof window === 'undefined') {
        const jsdom = require('jsdom');

        const globalDom = new jsdom.JSDOM();

        global.window = globalDom.window;
        global.document = globalDom.window.document;
    }
}

register();

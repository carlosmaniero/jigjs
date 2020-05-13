import "reflect-metadata";
import {configureJSDOM} from "./dom";

declare let global: any

export const register = () => {
    if (typeof window === 'undefined') {
        Object.assign(global, configureJSDOM());

        const toRequire = (global as any).__non_webpack_require__ || require;
        toRequire('mutationobserver-shim');
    }
}

register();

import '@abraham/reflection';

import {configureJSDOM} from "./dom";

declare let global: any

export const register = () => {
    if (typeof window === 'undefined') {
        Object.assign(global, configureJSDOM());

        require('mutationobserver-shim');
    }
}

register();

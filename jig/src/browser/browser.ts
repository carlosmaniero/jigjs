import {JigApp} from "../core/app";
import {createContainer} from "./di";
import {Platform} from "../core/platform";
import {DocumentInjectionToken, WindowInjectionToken} from "../core/dom";

export class JigBrowser {
    constructor(
        private readonly app: JigApp,
        readonly container = createContainer()
    ) {
        container.register(Platform, {useValue: Platform.browser()});
        container.register(DocumentInjectionToken, {useValue: window.document});
        container.register(WindowInjectionToken, {useValue: window});
    }

    init() {
        this.app.registerCustomElementClass(window as any, this.container);
    }
}

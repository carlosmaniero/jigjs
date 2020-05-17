import {JigApp} from "../core/app";
import {createContainer} from "./di";
import {Platform} from "../core/platform";
import {DocumentInjectionToken, WindowInjectionToken} from "../core/dom";
import {JigModule} from "../core/module";

export class JigBrowser {
    constructor(
        readonly modules: JigModule[] = [],
        readonly container = createContainer()
    ) {
        container.register(Platform, {useValue: Platform.browser()});
        container.register(DocumentInjectionToken, {useValue: window.document});
        container.register(WindowInjectionToken, {useValue: window});
    }

    init(app: JigApp) {
        this.modules.forEach((module) => {
            app.withModule(module);
        });

        app.registerCustomElementClass(window as any, this.container);
    }
}

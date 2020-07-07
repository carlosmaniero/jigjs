import {AppFactory} from "../app/app";
import {configureJSDOM} from "../../core/dom";
import {renderComponent} from "../../components";
import {waitUntil} from "../../reactive";
import {Response} from "./response";
import {render} from "../../template/render";
import {Platform} from "../patform/platform";

export class ServerSideRendering {
    constructor(private readonly appFactory: AppFactory, private readonly template: string, private querySelector: string) {
    }

    async renderRouteAsString(path: string): Promise<Response> {
        const dom = configureJSDOM(this.template, `http://localhost${path}`);
        const app = this.appFactory(dom.window, Platform.server());

        const rootContainer = dom.document.querySelector(this.querySelector);
        renderComponent(rootContainer, app);
        await waitUntil(app, () => app.isInitialRenderFinished());

        const status = app.isFinishedWithError() ? 500 : 200;
        const responseText = dom.serialize();

        render(dom.document.createElement('div'))(rootContainer);

        return {
            status,
            responseText,
        };
    }
}

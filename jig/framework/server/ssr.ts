import {AppFactory} from "../app/app";
import {configureJSDOM} from "../../core/dom";
import {renderComponent} from "../../components";
import {waitUntil} from "../../reactive";
import {render} from "../../template/render";
import {Platform} from "../patform/platform";

export interface ServerSideRenderingResponse {
    statusCode: number;
    headers: Record<string, string>;
    responseText: string;
}

export class ServerSideRendering {
    constructor(private readonly appFactory: AppFactory, private readonly template: string, private querySelector: string) {
    }

    async renderRouteAsString(path: string): Promise<ServerSideRenderingResponse> {
        const dom = configureJSDOM(this.template, `http://localhost${path}`);
        const app = this.appFactory(dom.window, Platform.server());

        const rootContainer = dom.document.querySelector(this.querySelector);
        renderComponent(rootContainer, app);
        await waitUntil(app, () => app.isInitialRenderFinished());

        const {statusCode, headers} = app.latestResponse;
        const responseText = dom.serialize();

        render(dom.document.createElement('div'))(rootContainer);

        return {
            statusCode: statusCode,
            responseText,
            headers
        };
    }
}

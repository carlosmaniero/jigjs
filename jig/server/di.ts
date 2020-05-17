import {globalContainer, Injectable} from "../core/di";
import {DocumentInjectionToken, WindowInjectionToken} from "../core/dom";
import {Platform} from "../core/platform";
import {Request, Response} from "../router/router";

@Injectable()
export class PerRequestContainer {
    createRequestContainer(request: Request, response: Response, dom: any) {
        const requestContainer = globalContainer.createChildContainer();

        requestContainer.register(Request.InjectionToken, {useValue: request});
        requestContainer.register(Response.InjectionToken, {useValue: response});
        requestContainer.register(DocumentInjectionToken, {useValue: dom.window.document});
        requestContainer.register(WindowInjectionToken, {useValue: dom.window});
        requestContainer.register(Platform, {useValue: new Platform(false)});

        return requestContainer;
    }
}

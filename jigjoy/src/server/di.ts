import {DIContainer, GlobalInjectable, registerContextualDependencies} from "../core/di";
import {Request as ExpressRequest, Response as ExpressResponse} from "express";
import {JSDOM} from "jsdom";
import {DocumentInjectionToken, WindowInjectionToken} from "../core/dom";

export type Request = ExpressRequest;
export type Response = ExpressResponse;

export const Request = {InjectionToken: 'Request'}
export const Response = {InjectionToken: 'Response'}

@GlobalInjectable()
export class PerRequestContainer {
    createRequestContainer(request: Request, response: Response, dom: JSDOM) {
        const requestContainer = DIContainer.createChildContainer();

        requestContainer.register(Request.InjectionToken, {useValue: request});
        requestContainer.register(Response.InjectionToken, {useValue: response});
        requestContainer.register(DocumentInjectionToken, {useValue: dom.window.document});
        requestContainer.register(WindowInjectionToken, {useValue: dom.window});

        registerContextualDependencies(requestContainer);

        return requestContainer;
    }
}

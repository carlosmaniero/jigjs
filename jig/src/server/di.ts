import {globalContainer, GlobalInjectable, Injectable} from "../core/di";
import {Request as ExpressRequest, Response as ExpressResponse} from "express";
import {DocumentInjectionToken, WindowInjectionToken} from "../core/dom";
import {Platform} from "../core/platform";

export type Request = ExpressRequest;
export type Response = ExpressResponse;

export const Request = {InjectionToken: 'Request'}
export const Response = {InjectionToken: 'Response'}

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

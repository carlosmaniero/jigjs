import {DIContainer, GlobalInjectable, registerContextualDependencies} from "../core/di";
import {Request as ExpressRequest, Response as ExpressResponse} from "express";

export type Request = ExpressRequest;
export type Response = ExpressResponse;

export const Request = {InjectionToken: 'Request'}
export const Response = {InjectionToken: 'Response'}

@GlobalInjectable()
export class PerRequestContainer {
    createRequestContainer(request: Request, response: Response) {
        const requestContainer = DIContainer.createChildContainer();
        requestContainer.register(Request.InjectionToken, {useValue: request});
        requestContainer.register(Response.InjectionToken, {useValue: response});

        registerContextualDependencies(requestContainer);

        return requestContainer;
    }
}

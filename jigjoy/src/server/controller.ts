import {DIContainer, GlobalInjectable} from "../core/di";
import {Request, Response} from 'express';
import fs from "fs";
import {JSDOM} from "jsdom";
import {JigJoyApp} from "../core/app";
import {BeforeFlushRequest, RequestWaitMiddleware} from "./middlewares";
import {PerRequestContainer} from "./di";

export interface ServerTemplateControllerResolver {
    app: JigJoyApp,
    templatePath: string,
    encode?: string,
    res: Response,
    req: Request,
}

@GlobalInjectable()
export class ServerTemplateController {
    constructor(private readonly perRequestContainer: PerRequestContainer) {
    }

    resolve({app, templatePath, encode, req, res}: ServerTemplateControllerResolver) {
        fs.readFile(templatePath, encode || 'utf-8', async (err, data) => {
            const dom = new JSDOM(data);
            const dependencyContainer = this.perRequestContainer.createRequestContainer(req, res, dom);

            app.registerCustomElementClass(dom.window as any, dependencyContainer);

            await ServerTemplateController.waitForMiddlewareList(dependencyContainer);

            ServerTemplateController.getBeforeFlushList(dependencyContainer).forEach((middleware) => {
                middleware.beforeFlushRequest()
            });

            res.send(dom.serialize());
        });
    }

    private static async waitForMiddlewareList(dependencyContainer: DIContainer) {
        const requestWaitMiddlewareList = ServerTemplateController.getWaitMiddlewareList(dependencyContainer);

        await Promise.all(
            requestWaitMiddlewareList
                .map((requestWaitMiddleware) => requestWaitMiddleware.wait()));
    }

    private static getWaitMiddlewareList(dependencyContainer: DIContainer): RequestWaitMiddleware[] {
        if (!dependencyContainer.isRegistered(RequestWaitMiddleware.InjectionToken)) {
            return [];
        }

        return dependencyContainer.resolveAll(RequestWaitMiddleware.InjectionToken);
    }

    private static getBeforeFlushList(dependencyContainer: DIContainer): BeforeFlushRequest[] {
        if (!dependencyContainer.isRegistered(BeforeFlushRequest.InjectionToken)) {
            return [];
        }

        return dependencyContainer.resolveAll(BeforeFlushRequest.InjectionToken);
    }
}

import {Container, Injectable} from "../core/di";
import {Request, Response} from 'express';
import fs from "fs";
import {JigApp} from "../core/app";
import {BeforeFlushRequest, RequestWaitMiddleware} from "./middlewares";
import {PerRequestContainer} from "./di";
import {configureJSDOM} from "../core/dom";

export interface ServerTemplateControllerResolver {
    app: JigApp;
    templatePath: string;
    encode?: string;
    res: Response;
    req: Request;
}

@Injectable()
export class ServerTemplateController {
    constructor(private readonly perRequestContainer: PerRequestContainer) {
    }

    resolve({app, templatePath, encode, req, res}: ServerTemplateControllerResolver) {
        fs.readFile(templatePath, encode || 'utf-8', async (err, data) => {
            const dom = configureJSDOM(data);
            const dependencyContainer = this.perRequestContainer.createRequestContainer(req, res, dom);

            await app.registerCustomElementClass(dom.window as any, dependencyContainer);

            await ServerTemplateController.waitForMiddlewareList(dependencyContainer);

            ServerTemplateController.getBeforeFlushList(dependencyContainer).forEach((middleware) => {
                middleware.beforeFlushRequest()
            });

            res.send(dom.serialize());
        });
    }

    private static async waitForMiddlewareList(dependencyContainer: Container) {
        const requestWaitMiddlewareList = ServerTemplateController.getWaitMiddlewareList(dependencyContainer);

        await Promise.all(
            requestWaitMiddlewareList
                .map((requestWaitMiddleware) => requestWaitMiddleware.wait()));
    }

    private static getWaitMiddlewareList(dependencyContainer: Container): RequestWaitMiddleware[] {
        if (!dependencyContainer.isRegistered(RequestWaitMiddleware.InjectionToken)) {
            return [];
        }

        return dependencyContainer.resolveAll(RequestWaitMiddleware.InjectionToken);
    }

    private static getBeforeFlushList(dependencyContainer: Container): BeforeFlushRequest[] {
        if (!dependencyContainer.isRegistered(BeforeFlushRequest.InjectionToken)) {
            return [];
        }

        return dependencyContainer.resolveAll(BeforeFlushRequest.InjectionToken);
    }
}

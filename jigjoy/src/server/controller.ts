import {DIContainer, GlobalInjectable} from "../core/di";
import {Request, Response} from 'express';
import fs from "fs";
import {JSDOM} from "jsdom";
import {JigJoyApp} from "../core/app";
import {RequestWaitMiddleware} from "./middlewares";
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
    constructor() {
    }

    private static getWaitMiddlewareList(dependencyContainer: DIContainer): RequestWaitMiddleware[] {
        if (!dependencyContainer.isRegistered(RequestWaitMiddleware.InjectionToken)) {
            return [];
        }

        return dependencyContainer.resolveAll(RequestWaitMiddleware.InjectionToken);
    }

    resolve({app, templatePath, encode, req, res}: ServerTemplateControllerResolver) {
        const perRequestContainer = DIContainer.resolve(PerRequestContainer);

        fs.readFile(templatePath, encode || 'utf-8', async (err, data) => {
            const dependencyContainer = perRequestContainer.createRequestContainer(req, res);

            const dom = new JSDOM(data);
            app.registerCustomElementClass(dom.window, dependencyContainer);

            await new Promise((resolve) => setImmediate(() => resolve()));

            await this.waitForMiddlewareList(dependencyContainer);

            res.send(dom.serialize());
        });
    }

    private async waitForMiddlewareList(dependencyContainer: DIContainer) {
        const requestWaitMiddlewareList = ServerTemplateController.getWaitMiddlewareList(dependencyContainer);

        await Promise.all(
            requestWaitMiddlewareList
                .map((requestWaitMiddleware) => requestWaitMiddleware.wait()));
    }
}

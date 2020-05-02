import {DIContainer, Injectable} from "../core/di";
import {Response} from 'express';
import fs from "fs";
import {JSDOM} from "jsdom";
import {JigJoyApp} from "../core/app";
import {RequestWaitMiddleware} from "./middlewares";

export interface ServerTemplateControllerResolver {
    app: JigJoyApp,
    templatePath: string,
    encode?: string,
    res: Response,
}

@Injectable()
export class ServerTemplateController {
    constructor() {
    }

    private static getWaitMiddlewareList(): RequestWaitMiddleware[] {
        if (!DIContainer.isRegistered(RequestWaitMiddleware.InjectionToken)) {
            return [];
        }

        return DIContainer.resolveAll(RequestWaitMiddleware.InjectionToken);
    }

    resolve({app, templatePath, encode, res}: ServerTemplateControllerResolver) {
        fs.readFile(templatePath, encode || 'utf-8', async (err, data) => {
            const dom = new JSDOM(data);
            app.registerCustomElementClass(dom.window);

            await this.waitForMiddlewareList();

            res.send(dom.serialize());
        });
    }

    private async waitForMiddlewareList() {
        const requestWaitMiddlewareList = ServerTemplateController.getWaitMiddlewareList();

        await Promise.all(
            requestWaitMiddlewareList
                .map((requestWaitMiddleware) => requestWaitMiddleware.wait()));
    }
}

import {RenderableComponent} from "../../components";
import RouteMatcher from "route-parser";
import {TransferState} from "../transfer-state";

export class RouterResponse {
    constructor(public statusCode = 200, public headers: Record<string, string> = {}) {
    }
}

export type RouterRender = (component: RenderableComponent) => void;

export type RouterHandler<T> = (
    params: T, render: RouterRender,
    transferState: TransferState,
    routerResponse: RouterResponse
) => Promise<void> | void;

export interface RouterHandlerDefinition<T extends object> {
    path: string;
    name: string;
    handler: RouterHandler<T>;
}

export class MatchedRouterHandler<T> {
    constructor(
        public readonly routerHandler: RouterHandler<T>,
        public readonly params: T,
        public readonly response: RouterResponse = new RouterResponse()) {
    }

    resolve(renderFn: RouterRender, transferState: TransferState): Promise<void> | void {
        return this.routerHandler(this.params, renderFn, transferState, this.response);
    }
}

export interface RouteErrorHandler {
    handle404?: RouterHandler<string>;
}

export class Routes {
    constructor(
        private readonly routerHandlers: RouterHandlerDefinition<unknown & object>[],
        readonly routerErrorHandler: RouteErrorHandler = {}
    ) {
    }

    handlerFor(path: string): MatchedRouterHandler<unknown & object> | null {
        for (const routerHandler of this.routerHandlers) {
            const matchResult = new RouteMatcher(routerHandler.path).match(path);

            if (matchResult) {
                return new MatchedRouterHandler(routerHandler.handler, matchResult);
            }
        }

        return null;
    }

    reverse(name: string, params: Record<string, string> = {}): string {
        for (const routerHandler of this.routerHandlers) {
            if (routerHandler.name === name) {
                const reversed = new RouteMatcher(routerHandler.path).reverse(params);

                if (!reversed) {
                    throw new Error(`It is not possible to revert "${routerHandler.path}" using '${JSON.stringify(params)}'.`);
                }

                return reversed;
            }
        }

        throw new Error(`There are no route named "${name}".`);
    }
}

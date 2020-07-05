import {RenderableComponent} from "../../components";
import RouteMatcher from "route-parser";

export type RouterRender = (component: RenderableComponent) => void;


export interface RouterHandler<T extends object> {
    path: string;
    name: string;
    handler: (params: T, render: RouterRender) => Promise<void> | void;
}

export class MatchedRouterHandler<T extends object> {
    constructor(public readonly routerHandler: RouterHandler<T>, public readonly params: T) {
    }

    resolve(renderFn: RouterRender): Promise<void> | void {
        return this.routerHandler.handler(this.params, renderFn);
    }
}

export class Routes {
    constructor(private readonly routerHandlers: RouterHandler<unknown & object>[]) {
    }

    handlerFor(path: string): MatchedRouterHandler<unknown & object> | null {
        for (const routerHandler of this.routerHandlers) {
            const matchResult = new RouteMatcher(routerHandler.path).match(path);

            if (matchResult) {
                return new MatchedRouterHandler(routerHandler, matchResult);
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

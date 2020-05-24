import {Request as ExpressRequest, Response as ExpressResponse} from "express";
import RouteMatcher from "route-parser";
import {Container, Inject, Injectable, Singleton} from "../core/di";
import {AnyComponent} from "../components/component";
import {Subject, Subscription} from "../events/subject";
import {WindowInjectionToken} from "../core/dom";

export type Request = ExpressRequest;
export type Response = ExpressResponse;
export const Request = {InjectionToken: 'Request'}
export const Response = {InjectionToken: 'Response'}

export interface RouterDefinition {
    route: string;
    name: string;
    component: AnyComponent;
}

export interface MatchResult {
    component: AnyComponent;
    name: string;
    params: Record<string, string>;
}

export class Routes {
    constructor(private readonly routerDefinitions: RouterDefinition[]) {
    }


    match(url: string): MatchResult | null {
        for (const routerDefinition of this.routerDefinitions) {
            const matchResult = new RouteMatcher(routerDefinition.route).match(url);

            if (matchResult) {
                return {
                    component: routerDefinition.component,
                    name: routerDefinition.name,
                    params: matchResult
                }
            }
        }
        return null;
    }

    byName(name: string): RouteMatcher | null {
        for (const routerDefinition of this.routerDefinitions) {
            if (routerDefinition.name === name) {
                return new RouteMatcher(routerDefinition.route);
            }
        }

        return null;
    }
}

@Singleton()
export class RouterHooks {
    readonly activateSubject: Subject<MatchResult> = new Subject<MatchResult>();
    readonly leaveSubject: Subject<MatchResult> = new Subject<MatchResult>();

    onActivate(callback): Subscription {
        return this.activateSubject.subscribe(callback);
    }

    onLeave(callback): Subscription {
        return this.leaveSubject.subscribe(callback);
    }
}

@Singleton()
export class Router {
    private latestMatchRoute: MatchResult;

    constructor(
        @Inject(WindowInjectionToken) private readonly window,
        private readonly routes: Routes,
        private readonly container: Container,
        private readonly hooks: RouterHooks
    ) {
    }

    init(): void {
        this.window.addEventListener('popstate', () => {
            this.resolve();
        });
        this.resolve();
    }

    goTo(name: string, params: Record<string, string> = {}): void {
        const url = this.reverse(name, params);

        this.hooks.leaveSubject.publish(this.getCurrentMatchResult());
        this.window.history.pushState(undefined, '', url);
        this.resolve();
    }

    reverse(name: string, params: Record<string, string>): string {
        const matcher = this.routes.byName(name);

        if (!matcher) {
            throw new Error(`There is no route called "${name}"`);
        }

        const url = matcher.reverse(params);

        if (!url) {
            throw new Error(`It was not possible to reverse URL for "${name}" with ${JSON.stringify(params)}`);
        }

        return url;
    }

    private resolve(): void {
        const matchResult = this.getCurrentMatchResult();

        if (this.latestMatchRoute) {
            this.hooks.leaveSubject.publish(this.latestMatchRoute);
        }

        this.hooks.activateSubject.publish(matchResult);
        this.latestMatchRoute = matchResult;
    }

    private getCurrentMatchResult(): MatchResult {
        return this.routes.match(this.getUrl(this.window));
    }

    private getUrl(window): string {
        return window.location.pathname + window.location.search;
    }
}

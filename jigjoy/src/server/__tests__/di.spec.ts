import {PerRequestContainer, Request, Response} from "../di";
import {globalContainer, Inject, Injectable, Singleton} from "../../core/di";
import {RequestWaitMiddleware} from "../middlewares";
import {JSDOM} from 'jsdom';
import {DocumentInjectionToken, WindowInjectionToken} from "../../core/dom";
import {Platform} from "../../core/platform";

describe('Server Dependency Injection', () => {
    const dom = new JSDOM();
    describe('RequestScopeInjectable', () => {
        it('decorates the class without changing its instance', () => {
            @Injectable()
            class MyClass {
                constructor(public readonly i: number) {
                }
            }

            expect(new MyClass(1).i).toEqual(1);
        });
    })

    it('registers a token in a request context', () => {
        @Injectable()
        class MyClass {
            constructor(
                @Inject(Request.InjectionToken) public readonly request: Request,
                @Inject(Response.InjectionToken) public readonly response: Response) {
            }
        }

        const request = jest.fn();
        const response = jest.fn();

        const requestContainer = new PerRequestContainer().createRequestContainer(request as any, response as any, dom);

        expect(requestContainer.resolve(MyClass).request).toEqual(request);
        expect(requestContainer.resolve(MyClass).response).toEqual(response);
    });

    it('throws an exception when trying to resolve a request scope class using global container', () => {
        @Injectable()
        class MyClass {
            constructor(
                @Inject(Request.InjectionToken) public readonly request: Request,
                @Inject(Response.InjectionToken) public readonly response: Response) {
            }
        }

        const request = jest.fn();
        const response = jest.fn();

        new PerRequestContainer().createRequestContainer(request as any, response as any, dom);

        expect(() => globalContainer.resolve(MyClass))
            .toThrow()
    });

    it('Request Scope Singleton returns always the same instance', () => {
        @Singleton([RequestWaitMiddleware.InjectionToken])
        class MyClass {
            constructor(
                @Inject(Request.InjectionToken) public readonly request: Request,
                @Inject(Response.InjectionToken) public readonly response: Response) {
            }
        }

        const request = jest.fn();
        const response = jest.fn();

        const container = new PerRequestContainer().createRequestContainer(request as any, response as any, dom);

        expect(container.resolve(MyClass)).toBe(container.resolve(MyClass));
    });

    it('registers window and document into context', () => {
        const request = jest.fn();
        const response = jest.fn();

        const container = new PerRequestContainer().createRequestContainer(request as any, response as any, dom);

        expect(container.resolve(WindowInjectionToken)).toBe(dom.window);
        expect(container.resolve(DocumentInjectionToken)).toBe(dom.window.document);
    });

    it('creates platform with browser false', () => {
        const request = jest.fn();
        const response = jest.fn();

        const container = new PerRequestContainer()
            .createRequestContainer(request as any, response as any, dom);

        expect(container.resolve(Platform).isBrowser).toBeFalsy();
    });
});

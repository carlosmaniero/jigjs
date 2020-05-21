import {Container, Inject, Singleton} from "../core/di";
import {WindowInjectionToken} from "../core/dom";
import {AnyComponent, JigWindow, lazyLoadComponent} from "../components/component";

export const ErrorHandlerComponentClassInjectionToken = 'ErrorHandlerComponentClassInjectionToken';

export type ErrorListener = (error: Error) => void

@Singleton()
export class ErrorHandler {
    private listeners = [];

    constructor(
        private readonly container: Container,
        @Inject(WindowInjectionToken) private readonly window: JigWindow,
        @Inject(ErrorHandlerComponentClassInjectionToken) private readonly componentClass?: AnyComponent) {}

    fatal(error: Error): void {
        this.renderFatalComponent(error);
        this.listeners.forEach((listener) => listener(error));
    }

    private renderFatalComponent(error: Error) {
        this.window.document.body.innerHTML = '';

        const component = lazyLoadComponent(this.window.document, this.componentClass, {error});
        this.window.document.body.appendChild(component);
    }

    listen(listener: ErrorListener) {
        this.listeners.push(listener)
    }
}

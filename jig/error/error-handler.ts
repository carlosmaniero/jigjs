import {Container, Inject, Singleton} from "../core/di";
import {WindowInjectionToken} from "../core/dom";
import {AnyComponent, JigWindow, lazyLoadComponent} from "../components/component";
import {Subject, Subscription} from "../events/subject";

export const ErrorHandlerComponentClassInjectionToken = 'ErrorHandlerComponentClassInjectionToken';

export type ErrorListener = (error: Error) => void

@Singleton()
export class ErrorHandler {
    private errorSubject: Subject<Error>;

    constructor(
        private readonly container: Container,
        @Inject(WindowInjectionToken) private readonly window: JigWindow,
        @Inject(ErrorHandlerComponentClassInjectionToken) private readonly componentClass?: AnyComponent) {
        this.errorSubject = new Subject<Error>();
    }

    fatal(error: Error): void {
        this.renderFatalComponent(error);
        this.errorSubject.publish(error);
    }

    private renderFatalComponent(error: Error) {
        this.window.document.body.innerHTML = '';

        const component = lazyLoadComponent(this.window.document, this.componentClass, {error});
        this.window.document.body.appendChild(component);
    }

    subscribe(listener: ErrorListener): Subscription {
        return this.errorSubject.subscribe(listener);
    }
}

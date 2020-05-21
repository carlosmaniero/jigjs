import {Component} from "../components/component";
import {html, Renderable} from "../template/render";
import {Inject} from "../core/di";
import {DocumentInjectionToken} from "../core/dom";

@Component('jigjs-default-error-handler-component')
export class DefaultErrorHandlerComponent {
    constructor(@Inject(DocumentInjectionToken) private readonly document) {}

    render(): Renderable {
        return html`<h1>Internal Server Error</h1>`;
    }

    mount(): void {
        this.document.title = 'Internal Server Error';
    }
}

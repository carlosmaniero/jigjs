import {configureJSDOM, DocumentInjectionToken, WindowInjectionToken} from "../../core/dom";
import {Container} from "../../core/di";
import {ErrorHandler, ErrorHandlerComponentClassInjectionToken} from "../error-handler";
import {Component, componentFactoryFor, Prop, RehydrateService} from "../../components/component";
import {ServerRehydrateService} from "../../components/server/server-rehydrate-service";
import {Platform} from "../../core/platform";
import {html, Renderable} from "../../template/render";
import {DefaultErrorHandlerComponent} from "../default-error-handler-component";

describe('Error Handle', () => {
    const createTestContainer = (dom): Container => {
        const container = new Container();
        container.register(ErrorHandler, ErrorHandler);
        container.register(RehydrateService.InjectionToken, ServerRehydrateService);
        container.register(WindowInjectionToken, {useValue: dom.window});
        container.register(DocumentInjectionToken, {useValue: dom.document});
        container.register(Platform, {useValue: new Platform(false)});
        return container;
    }


    it('Overrides the document body with an error message', () => {
        const dom = configureJSDOM();

        dom.document.title = 'Hello, World!';
        dom.body.innerHTML = 'Hello, World!';

        const container = createTestContainer(dom);
        container.register(DefaultErrorHandlerComponent, DefaultErrorHandlerComponent);
        container.register(ErrorHandlerComponentClassInjectionToken, {useValue: DefaultErrorHandlerComponent});
        const errorHandler = container.resolve<ErrorHandler>(ErrorHandler);
        const factory = componentFactoryFor(DefaultErrorHandlerComponent);
        factory.registerComponent(dom.window as any, container);

        errorHandler.fatal(new Error('Any thing'));

        expect(dom.body.innerHTML).toContain('Internal Server Error');
        expect(dom.body.innerHTML).not.toContain('Hello, World!');
        expect(dom.document.title).toBe('Internal Server Error');
    });

    it('renders the error component when given', () => {
        const dom = configureJSDOM();

        @Component('my-error-component')
        class MyComponent {
            @Prop()
            private readonly error: Error;

            render(): Renderable {
                return html`Something went wrong! ${this.error.message}`;
            }
        }

        const container = createTestContainer(dom);
        container.register(MyComponent, MyComponent);
        const factory = componentFactoryFor(MyComponent);
        factory.registerComponent(dom.window as any, container);
        container.register(ErrorHandlerComponentClassInjectionToken, {useValue: MyComponent});

        const errorHandler = container.resolve<ErrorHandler>(ErrorHandler);

        errorHandler.fatal(new Error('Any thing'));

        expect(dom.body.innerHTML).toContain('Something went wrong! Any thing');
    });

    it('calls error listeners', () => {
        const dom = configureJSDOM();

        const container = createTestContainer(dom);

        const mock1 = jest.fn();
        const mock2 = jest.fn();

        container.register(ErrorHandlerComponentClassInjectionToken, {useValue: DefaultErrorHandlerComponent});
        container.resolve<ErrorHandler>(ErrorHandler).subscribe(mock1)
        container.resolve<ErrorHandler>(ErrorHandler).subscribe(mock2)

        const error = new Error('Any thing');
        container.resolve<ErrorHandler>(ErrorHandler).fatal(error);

        expect(mock1).toBeCalledWith(error);
        expect(mock2).toBeCalledWith(error);
    });
});

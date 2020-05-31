import {composableComponent, Subject} from "../composable-component";
import {html, Renderable} from "../../template/render";
import {componentFactoryFor, Prop, RehydrateService} from "../component";
import {configureJSDOM} from "../../core/dom";
import {Container} from "../../core/di";
import {ServerRehydrateService} from "../server/server-rehydrate-service";

describe('Composable Components', () => {
    it('access the subject', () => {
        class MyComposable {
            @Subject() private readonly subject: any;

            render(): Renderable {
                return this.subject.renderHi();
            }
        }

        const MyComposableComponent = composableComponent<any>(MyComposable);

        @MyComposableComponent('cool-component')
        class MyClass {
            renderHi(): Renderable {
                return html`hi!`;
            }
        }

        const container = new Container();
        container.register(MyClass, MyClass);
        container.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const dom = configureJSDOM();
        const factory = componentFactoryFor(MyClass);
        factory.registerComponent(dom.window, container);

        dom.body.innerHTML = `<cool-component></cool-component>`;

        expect(dom.serialize()).toContain('hi!');
    });

    it('apply props', () => {
        class MyComposable {
            @Subject() private readonly mySubjectWithProps: any

            render(): Renderable {
                return this.mySubjectWithProps.renderHi();
            }
        }

        const MyComposableComponent = composableComponent<any>(MyComposable);

        @MyComposableComponent('cool-component')
        class MyClass {
            @Prop()
            private readonly name;

            renderHi(): Renderable {
                return html`Hello, ${this.name}!`;
            }
        }

        const container = new Container();
        container.register(MyClass, MyClass);
        container.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const dom = configureJSDOM();
        const factory = componentFactoryFor(MyClass);
        factory.registerComponent(dom.window, container);

        dom.body.innerHTML = `<cool-component name="World"></cool-component>`;

        expect(dom.serialize()).toContain('Hello, World!');
    });


    it('composable has its own props', () => {
        class MyComposable {
            @Subject()
            public readonly subject: any;
            @Prop()
            private readonly name: string;

            render(): Renderable {
                return html`Reverse of ${this.name} is ${this.subject.reverseName}`;
            }
        }

        const MyComposableComponent = composableComponent<any>(MyComposable);

        @MyComposableComponent('cool-component')
        class MyClass {
            @Prop()
            private readonly name: string;

            get reverseName() {
                return this.name.split("").reverse().join("");
            }
        }

        const container = new Container();
        container.register(MyClass, MyClass);
        container.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const dom = configureJSDOM();
        const factory = componentFactoryFor(MyClass);
        factory.registerComponent(dom.window, container);

        dom.body.innerHTML = `<cool-component name="World"></cool-component>`;

        expect(dom.serialize()).toContain('Reverse of World is dlroW');
    });
});

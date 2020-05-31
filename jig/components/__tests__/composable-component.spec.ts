import {composableComponent, Subject} from "../composable-component";
import {html, Renderable} from "../../template/render";
import {componentFactoryFor, Prop, RehydrateService, State} from "../component";
import {configureJSDOM} from "../../core/dom";
import {Container} from "../../core/di";
import {ServerRehydrateService} from "../server/server-rehydrate-service";
import {waitForPromises} from "../../testing/wait-for-promises";

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

    it('can be used multiple times', () => {
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

        @MyComposableComponent('cool-component-2')
        class MyClass2 {
            renderHi(): Renderable {
                return html`hello!`;
            }
        }

        const container = new Container();
        container.register(MyClass, MyClass);
        container.register(MyClass2, MyClass2);
        container.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const dom = configureJSDOM();

        componentFactoryFor(MyClass).registerComponent(dom.window, container);
        componentFactoryFor(MyClass2).registerComponent(dom.window, container);

        dom.body.innerHTML = `
            <cool-component></cool-component>
            <cool-component-2></cool-component-2>
        `;

        expect(dom.serialize()).toContain('hi!');
        expect(dom.serialize()).toContain('hello!');
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

    it('handle state change multiple times', async () => {
        class MyComposable {
            @Subject()
            public readonly subject: any;
            @State()
            private state: {
                person?: {
                    name: string;
                };
            } = {};

            render(): Renderable {
                if (!this.state.person) {
                    return;
                }
                return html`Reverse of ${this.state.person.name} is ${this.subject.reverseName(this.state.person.name)}`;
            }

            mount() {
                setImmediate(() => {
                    this.state = {
                        person: {
                            name: 'Universe',
                        }
                    };
                    this.state = {
                        person: {
                            name: 'World',
                        }
                    };
                });
            }
        }

        const MyComposableComponent = composableComponent<any>(MyComposable);

        @MyComposableComponent('cool-component')
        class MyClass {
            reverseName(name: string) {
                return name.split("").reverse().join("");
            }
        }

        const container = new Container();
        container.register(MyClass, MyClass);
        container.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const dom = configureJSDOM();
        const factory = componentFactoryFor(MyClass);
        factory.registerComponent(dom.window, container);

        dom.body.innerHTML = `<cool-component></cool-component>`;

        await waitForPromises();

        expect(dom.serialize()).toContain('Reverse of World is dlroW');
    });


    it('handle partial state change', async () => {
        class MyComposable {
            @Subject()
            public readonly subject: any;
            @State()
            private state: {
                name?: string;
            } = {};

            render(): Renderable {
                if (!this.state.name) {
                    return;
                }
                return html`Reverse of ${this.state.name} is ${this.subject.reverseName(this.state.name)}`;
            }

            mount() {
                setImmediate(() => {
                    this.state.name = 'World';
                });
            }
        }

        const MyComposableComponent = composableComponent<any>(MyComposable);

        @MyComposableComponent('cool-component')
        class MyClass {
            reverseName(name: string) {
                return name.split("").reverse().join("");
            }
        }

        const container = new Container();
        container.register(MyClass, MyClass);
        container.register(RehydrateService.InjectionToken, ServerRehydrateService);

        const dom = configureJSDOM();
        const factory = componentFactoryFor(MyClass);
        factory.registerComponent(dom.window, container);

        dom.body.innerHTML = `<cool-component></cool-component>`;

        await waitForPromises();

        expect(dom.serialize()).toContain('Reverse of World is dlroW');
    });
});

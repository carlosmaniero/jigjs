import {
    ComponentAnnotation,
    componentFactoryFor,
    OnMount,
    OnRehydrate,
    OnUnmount,
    Prop,
    RehydrateService,
    RenderResult,
    State,
    StateFactoryWithValue
} from "../component";
import {DIContainer} from "../../core/di";
import {ServerRehydrateService} from "../server/server-rehydrate-service";
import waitForExpect from "wait-for-expect";
import * as testingLibrary from "@testing-library/dom";
import {html, render} from "../../template/render";
import {configureJSDOM} from "../../core/dom";
import {Platform} from "../../core/platform";

describe('Component Annotation', () => {
    beforeEach(() => {
        DIContainer.register(Platform, {useValue: new Platform(false)});
    });

    describe('render lifecycle', () => {
        it('renders a component', async () => {
            @ComponentAnnotation('my-component')
            class MyComponent {
                render() {
                    return html`Hello, World!`
                }
            }

            const factory = componentFactoryFor(MyComponent);

            const dom = configureJSDOM();

            DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            factory.registerComponent(dom.window as any, DIContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';

            await waitForExpect(() => {
                expect(dom.serialize()).toContain('Hello, World!');
            });
        });

        it('updates the state partially', () => {
            @ComponentAnnotation('my-component')
            class MyComponent {
                @State()
                private state = {
                    name: 'Universe'
                }

                render() {
                    return html`Hello, ${this.state.name}!`
                }
            }

            const factory = componentFactoryFor(MyComponent);

            const dom = configureJSDOM();

            DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            factory.registerComponent(dom.window as any, DIContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';

            (dom.window.document.querySelector('my-component') as any).componentInstance.state.name = 'World';

            expect(dom.serialize()).toContain('World');
        });

        it('updates the entire state', () => {
            @ComponentAnnotation('my-component')
            class MyComponent {
                @State()
                private state = {
                    name: 'Universe'
                }

                render() {
                    return html`Hello, ${this.state.name}!`
                }
            }

            const factory = componentFactoryFor(MyComponent);

            const dom = configureJSDOM();

            DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            factory.registerComponent(dom.window as any, DIContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';

            (dom.window.document.querySelector('my-component') as any).componentInstance.state = {
                name: 'World'
            };

            expect(dom.serialize()).toContain('World');
        });

        it('has a mount method', () => {
            @ComponentAnnotation('my-component')
            class MyComponent implements OnMount {
                @State()
                private state = {
                    name: 'Universe'
                }

                render() {
                    return html`Hello, ${this.state.name}!`
                }

                mount() {
                    this.state.name = 'World'
                }
            }

            const factory = componentFactoryFor(MyComponent);

            const dom = configureJSDOM();

            DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            factory.registerComponent(dom.window as any, DIContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';

            expect(dom.serialize()).toContain('World');
        });

        it('updates render for state change of abstract class', () => {
            abstract class MyComponentBase implements OnMount {
                @State()
                private state = {
                    name: 'Universe'
                }

                render() {
                    return html`Hello, ${this.state.name}!`
                }

                mount() {
                    this.state.name = 'World'
                }
            }

            @ComponentAnnotation('my-component')
            class MyComponent extends MyComponentBase {
            }

            const factory = componentFactoryFor(MyComponent);

            const dom = configureJSDOM();

            DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            factory.registerComponent(dom.window as any, DIContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';

            expect(dom.serialize()).toContain('World');
        });

        it('has a unmount method', () => {
            const mock = jest.fn();
            @ComponentAnnotation('my-component')
            class MyComponent implements OnUnmount {
                @State()
                private state = {
                    name: 'Universe'
                }

                render() {
                    return html`Hello, ${this.state.name}!`
                }

                unmount(): void {
                    mock();
                }
            }

            const dom = configureJSDOM();

            DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);

            const factory = componentFactoryFor(MyComponent);
            factory.registerComponent(dom.window as any, DIContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';
            dom.window.document.body.innerHTML = '';

            expect(mock).toBeCalled();
        });
    });

    describe('State', () => {
        it('updates state', () => {
           const state = StateFactoryWithValue<{name: string}>(jest.fn())({
               name: 'la'
           });
           state.name = 'My Name'

           expect(state.name).toBe('My Name');
        });

        it('calls the update render function', () => {
            const mock = jest.fn();
            const state = StateFactoryWithValue<{name: string}>(mock)({
                name: 'hi!'
            });
            state.name = 'My Name'

            expect(mock).toBeCalled();
        });

        it('calls the update render function for nested properties', () => {
            const mock = jest.fn();
            const state = StateFactoryWithValue<{person: {name: string}}>(mock)({
                person: {
                    name: 'Socrates'
                }
            });

            state.person.name = 'Biro-Biro';

            expect(mock).toBeCalledTimes(1);
        });
    });

    describe('Props', () => {
        it('has props that can be passed as is without serialization', () => {

            @ComponentAnnotation('user-component')
            class UserComponent {
                @Prop()
                private readonly id: number;

                @Prop()
                private readonly profile: {name: string}

                render() {
                    return html`<div><strong>#${this.id}</strong> <h1>${this.profile.name}</h1></div>`
                }
            }

            const dom = configureJSDOM();

            DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            componentFactoryFor(UserComponent).registerComponent(dom.window as any, DIContainer);

            const body = dom.window.document.body;
            render(html`
                <user-component
                    @id="${1}"
                    @profile="${{name: 'Formiga'}}">
                </user-component>`)(body);

            expect(testingLibrary.getByText(body, '#1')).not.toBeNull();
            expect(testingLibrary.getByText(body, 'Formiga')).not.toBeNull();
        });
    });

    describe('Rehydrating', () => {
        describe('when populating rehydration servicer', () => {
            it('pushes the render result into rehydration service', async () => {
                const rehydrateService = new ServerRehydrateService();
                DIContainer.register(RehydrateService.InjectionToken, {useValue: rehydrateService});

                @ComponentAnnotation("component-custom")
                class MyComponent {
                    @State()
                    private state = {name: 'World'};

                    render(): RenderResult {
                        return html`Hey!`
                    }
                }

                const dom = configureJSDOM();
                const factory = componentFactoryFor(MyComponent);
                factory.registerComponent(dom.window as any, DIContainer);

                dom.window.document.body.innerHTML =
                    '<component-custom></component-custom>'

                const element = dom.window.document.querySelector('component-custom');
                expect(element.getAttribute('rehydrate-context-name')).toBe('0');
                const contextName = element.getAttribute('rehydrate-context-name');
                expect(rehydrateService.getContext(contextName)).toEqual({name: 'World'});
            });

            it('updates the rehydration service given a state change', async () => {
                const rehydrateService = new ServerRehydrateService();
                DIContainer.register(RehydrateService.InjectionToken, {useValue: rehydrateService});

                @ComponentAnnotation("component-custom")
                class MyComponent implements OnMount {
                    @State()
                    private state = {name: 'World'};

                    render(): RenderResult {
                        return html`Hey!`
                    }

                    mount() {
                        this.state.name = 'Universe'
                    }
                }

                const dom = configureJSDOM();
                const factory = componentFactoryFor(MyComponent);
                factory.registerComponent(dom.window as any, DIContainer);

                dom.window.document.body.innerHTML =
                    '<component-custom></component-custom>'

                const element = dom.window.document.querySelector('component-custom');
                const contextName = element.getAttribute('rehydrate-context-name');
                expect(rehydrateService.getContext(contextName)).toEqual({name: 'Universe'});
            });
        });

        describe('when rehydrate', () => {
            describe('recovering state from server', () => {
                let dom;
                let originalDiv: HTMLDivElement;
                let rehydrateMock;
                let mountMock;

                beforeEach(() => {
                    const rehydrateService = new ServerRehydrateService();
                    DIContainer.register(RehydrateService.InjectionToken, {useValue: rehydrateService});

                    rehydrateService.updateContext("0", {name: 'World'});
                    rehydrateMock = jest.fn();
                    mountMock = jest.fn();

                    @ComponentAnnotation('component-custom')
                    class MyComponent implements OnRehydrate, OnMount {
                        @State()
                        state = {
                            name: 'no-name'
                        };

                        render(): RenderResult {
                            return html`<div>Hello, ${this.state.name}</div>`
                        }

                        rehydrate(): void {
                            rehydrateMock();
                        }

                        mount(): void {
                            mountMock();
                        }
                    }

                    dom = configureJSDOM();
                    const factory = componentFactoryFor(MyComponent);
                    factory.registerComponent(dom.window as any, DIContainer);

                    dom.window.document.body.innerHTML =
                        '<component-custom rehydrate-context-name="0"><div>Hello, World</div></component-custom>'

                    originalDiv = dom.window.document.querySelector('div');

                });

                it('renders the content of rehydration', async () => {
                    await waitForExpect(() => {
                        expect(testingLibrary.getAllByText(dom.window.document.body, "Hello, World")).toHaveLength(1);
                    });
                });

                it('keep the innerHtml', () => {
                    expect(dom.window.document.querySelector('div') === originalDiv).toBeTruthy();
                });

                it('updates the state with the context', () => {
                    expect(dom.window.document
                        .querySelector('component-custom').componentInstance.state).toEqual({name: 'World'});
                });

                it('calls the rehydrate method when rehydrate', () => {
                    expect(rehydrateMock).toBeCalled();
                });

                it('does not calls the mount method when rehydrate', () => {
                    expect(mountMock).not.toBeCalled();
                });
            });
            describe('controlling rendering', () => {
                it('does not update the content when should update is false', () => {
                    @ComponentAnnotation("component-custom")
                    class MyComponent {
                        render(): RenderResult {
                            return html`Anything else!`
                        }

                        shouldUpdate() {
                            return false;
                        }
                    }

                    DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
                    const dom = configureJSDOM();
                    const factory = componentFactoryFor(MyComponent);
                    factory.registerComponent(dom.window as any, DIContainer);

                    dom.window.document.body.innerHTML =
                        '<component-custom>Corinthians</component-custom>'

                    const element = dom.window.document.querySelector('component-custom');
                    expect(element.textContent).toBe('Corinthians');
                });

                it('passes the current element and the next', () => {
                    expect.assertions(2);

                    @ComponentAnnotation("component-custom")
                    class MyComponent {
                        render(): RenderResult {
                            return html`Anything else!`
                        }

                        shouldUpdate(context) {
                            expect(context.from.textContent).toBe('Corinthians')
                            expect(context.to.textContent).toBe('Anything else!')
                            return false;
                        }
                    }

                    DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
                    const dom = configureJSDOM();
                    const factory = componentFactoryFor(MyComponent);
                    factory.registerComponent(dom.window as any, DIContainer);

                    dom.window.document.body.innerHTML =
                        '<component-custom>Corinthians</component-custom>'
                });
            });
        });
    });
});

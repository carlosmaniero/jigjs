import {
    ComponentAnnotation,
    componentFactoryFor,
    OnMount,
    OnRehydrate,
    OnUnmount, RehydrateService, RenderResult,
    State,
    StateFactoryWithValue
} from "../component";
import {html} from "lighterhtml";
import {DIContainer} from "../../core/di";
import {ServerRehydrateService} from "../server/server-rehydrate-service";
import {JSDOM} from 'jsdom';
import waitForExpect from "wait-for-expect";
import * as testingLibrary from "@testing-library/dom";

describe('Component Annotation', () => {
    describe('render lifecycle', () => {
        it('renders a component', () => {
            @ComponentAnnotation('my-component')
            class MyComponent {
                render() {
                    return html`Hello, World!`
                }
            }

            const factory = componentFactoryFor(MyComponent);

            const dom = new JSDOM();

            DIContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            factory.registerComponent(dom.window as any, DIContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';

            expect(dom.serialize()).toContain('Hello, World!');
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

            const dom = new JSDOM();

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

            const dom = new JSDOM();

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

            const dom = new JSDOM();

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

            const dom = new JSDOM();

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

            const dom = new JSDOM();

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

                const dom = new JSDOM();
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

                const dom = new JSDOM();
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

                dom = new JSDOM();
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
    });
});

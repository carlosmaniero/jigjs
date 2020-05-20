import {Component, componentFactoryFor, Prop, RehydrateService, RenderResult, State} from "../component";
import {globalContainer, Injectable} from "../../core/di";
import {ServerRehydrateService} from "../server/server-rehydrate-service";
import waitForExpect from "wait-for-expect";
import * as testingLibrary from "@testing-library/dom";
import {html, render, Renderable} from "../../template/render";
import {configureJSDOM} from "../../core/dom";
import {Platform} from "../../core/platform";
import {createStateProxy} from "../component-state";

describe('Component Annotation', () => {
    beforeEach(() => {
        globalContainer.register(Platform, {useValue: new Platform(false)});
    });

    describe('render lifecycle', () => {
        it('renders a component', async () => {
            @Component('my-component')
            class MyComponent {
                render() {
                    return html`Hello, World!`
                }
            }

            globalContainer.register(MyComponent, MyComponent);

            const factory = componentFactoryFor(MyComponent);

            const dom = configureJSDOM();

            globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';

            await waitForExpect(() => {
                expect(dom.serialize()).toContain('Hello, World!');
            });
        });

        it('calls the afterRender hook', async () => {
            const dom = configureJSDOM();
            const afterRenderMock = jest.fn();

            @Component('my-component')
            class MyComponent {
                render(): Renderable {
                    return html`Hello, World!`
                }

                afterRender(): void {
                    afterRenderMock(dom.serialize());
                }
            }

            globalContainer.register(MyComponent, MyComponent);

            const factory = componentFactoryFor(MyComponent);

            globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';

            expect(afterRenderMock).toBeCalled();
            expect(afterRenderMock.mock.calls[0][0]).toContain('Hello, World!');
        });

        it('does not fully updates components', () => {
            @Component('my-component')
            class MyComponent {
                @Prop()
                private readonly name: string;

                render() {
                    return html`Hello, ${this.name}`
                }
            }

            globalContainer.register(MyComponent, MyComponent);

            const factory = componentFactoryFor(MyComponent);

            const dom = configureJSDOM();

            globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            factory.registerComponent(dom.window as any, globalContainer);

            render(html`<my-component @name="World"></my-component>`)(dom.window.document.body);
            expect(dom.window.document.body.textContent).toContain('World');

            render(html`<my-component @name="Universe"></my-component>`)(dom.window.document.body);
            expect(dom.window.document.body.textContent).toContain('Universe');
        });

        it('updates the state partially', () => {
            @Component('my-component')
            class MyComponent {
                @State()
                private state = {
                    name: 'Universe'
                }

                render() {
                    return html`Hello, ${this.state.name}!`
                }
            }

            globalContainer.register(MyComponent, MyComponent);

            const factory = componentFactoryFor(MyComponent);

            const dom = configureJSDOM();

            globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';

            (dom.window.document.querySelector('my-component') as any).componentInstance.state.name = 'World';

            expect(dom.serialize()).toContain('World');
        });

        it('updates the entire state', () => {
            @Component('my-component')
            class MyComponent {
                @State()
                private state = {
                    name: 'Universe'
                }

                render() {
                    return html`Hello, ${this.state.name}!`
                }
            }

            globalContainer.register(MyComponent, MyComponent);
            const factory = componentFactoryFor(MyComponent);

            const dom = configureJSDOM();

            globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';

            (dom.window.document.querySelector('my-component') as any).componentInstance.state = {
                name: 'World'
            };

            expect(dom.serialize()).toContain('World');
        });

        it('has a mount method', () => {
            @Component('my-component')
            class MyComponent {
                @State()
                private state = {
                    name: 'Universe'
                }

                render() {
                    return html`Hello, ${this.state.name}!`
                }

                mount(): void {
                    this.state.name = 'World'
                }
            }

            globalContainer.register(MyComponent, MyComponent);
            const factory = componentFactoryFor(MyComponent);

            const dom = configureJSDOM();

            globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';

            expect(dom.serialize()).toContain('World');
        });

        it('updates render for state change of abstract class', () => {
            @Injectable()
            abstract class MyComponentBase {
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

            @Component('my-component')
            class MyComponent extends MyComponentBase {
            }

            globalContainer.register(MyComponent, MyComponent);
            const factory = componentFactoryFor(MyComponent);

            const dom = configureJSDOM();

            globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';

            expect(dom.serialize()).toContain('World');
        });

        it('has a unmount method', () => {
            const mock = jest.fn();

            @Component('my-component')
            class MyComponent {
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

            globalContainer.register(MyComponent, MyComponent);
            globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);

            const factory = componentFactoryFor(MyComponent);
            factory.registerComponent(dom.window as any, globalContainer);

            dom.window.document.body.innerHTML = '<my-component></my-component>';
            dom.window.document.body.innerHTML = '';

            expect(mock).toBeCalled();
        });
    });

    describe('State', () => {
        it('updates state', () => {
            const state = createStateProxy<{ name: string }>(jest.fn())({
                name: 'la'
            });
            state.name = 'My Name'

            expect(state.name).toBe('My Name');
        });

        it('calls the update render function', () => {
            const mock = jest.fn();
            const state = createStateProxy<{ name: string }>(mock)({
                name: 'hi!'
            });
            state.name = 'My Name'

            expect(mock).toBeCalled();
        });

        it('calls the update render function for nested properties', () => {
            const mock = jest.fn();
            const state = createStateProxy<{ person: { name: string } }>(mock)({
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

            @Component('user-component')
            class UserComponent {
                @Prop()
                private readonly id: number;

                @Prop()
                private readonly profile: { name: string }

                render() {
                    return html`<div><strong>#${this.id}</strong> <h1>${this.profile.name}</h1></div>`
                }
            }

            const dom = configureJSDOM();

            globalContainer.register(UserComponent, UserComponent);
            globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
            componentFactoryFor(UserComponent).registerComponent(dom.window as any, globalContainer);

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
                globalContainer.register(RehydrateService.InjectionToken, {useValue: rehydrateService});

                @Component("component-custom")
                class MyComponent {
                    @State()
                    private state = {name: 'World'};

                    render(): RenderResult {
                        return html`Hey!`
                    }
                }

                const dom = configureJSDOM();
                globalContainer.register(MyComponent, MyComponent);
                const factory = componentFactoryFor(MyComponent);
                factory.registerComponent(dom.window as any, globalContainer);

                dom.window.document.body.innerHTML =
                    '<component-custom></component-custom>'

                const element = dom.window.document.querySelector('component-custom');
                expect(element.getAttribute('rehydrate-context-name')).toBe('0');
                const contextName = element.getAttribute('rehydrate-context-name');
                expect(rehydrateService.getContext(contextName)).toEqual({name: 'World'});
            });

            it('updates the rehydration service given a state change', async () => {
                const rehydrateService = new ServerRehydrateService();
                globalContainer.register(RehydrateService.InjectionToken, {useValue: rehydrateService});

                @Component("component-custom")
                class MyComponent {
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
                globalContainer.register(MyComponent, MyComponent);
                const factory = componentFactoryFor(MyComponent);
                factory.registerComponent(dom.window as any, globalContainer);

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
                    globalContainer.register(RehydrateService.InjectionToken, {useValue: rehydrateService});

                    rehydrateService.updateContext("0", {name: 'World'});
                    rehydrateMock = jest.fn();
                    mountMock = jest.fn();

                    @Component('component-custom')
                    class MyComponent {
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

                    globalContainer.register(MyComponent, MyComponent);
                    dom = configureJSDOM();
                    const factory = componentFactoryFor(MyComponent);
                    factory.registerComponent(dom.window as any, globalContainer);

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
                    @Component("component-custom")
                    class MyComponent {
                        render(): RenderResult {
                            return html`Anything else!`
                        }

                        shouldRenderAfterRehydrate() {
                            return false;
                        }
                    }

                    globalContainer.register(MyComponent, MyComponent);
                    globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
                    const dom = configureJSDOM();
                    const factory = componentFactoryFor(MyComponent);
                    factory.registerComponent(dom.window as any, globalContainer);

                    dom.window.document.body.innerHTML =
                        '<component-custom rehydrate-context-name="0">Corinthians</component-custom>'

                    const element = dom.window.document.querySelector('component-custom');
                    expect(element.textContent).toBe('Corinthians');
                });

                it('binds the events', () => {
                    @Component("component-custom")
                    class MyComponent {
                        @State()
                        private readonly state = {
                            count: 0
                        }

                        render(): RenderResult {
                            return html`<button onclick="${(): number => this.state.count++}">+</button><span>${this.state.count}</span>`
                        }
                    }

                    globalContainer.register(MyComponent, MyComponent);
                    const serverRehydrateService = new ServerRehydrateService();
                    globalContainer.register(RehydrateService.InjectionToken, {useValue: serverRehydrateService});
                    const dom = configureJSDOM();
                    const factory = componentFactoryFor(MyComponent);
                    factory.registerComponent(dom.window as any, globalContainer);

                    serverRehydrateService.updateContext('0', {
                        count: 10
                    });

                    dom.window.document.body.innerHTML =
                        '<component-custom rehydrate-context-name="0"><button>+</button><span>10</span></component-custom>';

                    dom.window.document.querySelector('button').click();

                    expect(dom.window.document.querySelector('span').textContent).toBe('11');
                });
            });
        });
    });
});

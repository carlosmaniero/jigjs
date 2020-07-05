import {
    component,
    connectedCallback,
    connectedCallbackNode,
    disconnectedCallback,
    disconnectedCallbackNode,
    html,
    RenderableComponent,
    renderComponent
} from "../";
import {configureJSDOM, DOM} from "../../core/dom";
import {HTMLElementWithJigProperties, render, Renderable} from "../../template/render";
import {observable, observing, propagate, subscribersCount} from "../../reactive";
import {waitForPromises} from "../../testing/wait-for-promises";

@component()
class ParentComponent {
    @observing()
    public childComponent: RenderableComponent;

    constructor(childComponent: RenderableComponent) {
        this.childComponent = childComponent;
    }

    render(): Renderable {
        return html`child say: <strong>${this.childComponent}</strong>`;
    }
}

@component()
class ParentComponentList {
    @observing()
    public childComponents: RenderableComponent[];

    constructor(childComponents: RenderableComponent[]) {
        this.childComponents = childComponents;
    }

    render(): Renderable {
        return html`child say: ${this.childComponents}`;
    }
}

@component()
class ChildComponent {
    @observing()
    public say: string;

    constructor(say: string) {
        this.say = say;
    }

    render(): Renderable {
        return html`${this.say}`;
    }
}

const renderTestComponent = (component: RenderableComponent): DOM => {
    const dom = configureJSDOM();
    renderComponent(dom.body, component);
    return dom;
}

describe('@pureComponent', () => {
    it('renders a simple component', () => {
        @component()
        class HelloWorldComponent {
            render(): Renderable {
                return html`Hello, World!`;
            }
        }

        const helloWorldComponent = new HelloWorldComponent();
        const dom = configureJSDOM();

        renderComponent(dom.body, helloWorldComponent);

        expect(dom.body.textContent).toContain('Hello, World!');
    });

    it('has only one subscriber when render', () => {
        @component()
        class HelloWorldComponent {
            render(): Renderable {
                return html`Hello, World!`;
            }
        }

        const helloWorldComponent = new HelloWorldComponent();
        const dom = configureJSDOM();

        renderComponent(dom.body, helloWorldComponent);

        expect(subscribersCount(helloWorldComponent)).toBe(1);
    });

    describe('rendering child components', () => {
        it('renders a child', () => {
            const component = new ParentComponent(new ChildComponent('Hello!'));
            const dom = configureJSDOM();

            renderComponent(dom.body, component);

            expect(dom.body.textContent).toContain('child say: Hello!');
        });

        it('renders a child list', () => {
            const component = new ParentComponentList(
                [
                    new ChildComponent('Hello!'),
                    new ChildComponent('Hi!')
                ]
            );

            const dom = configureJSDOM();
            renderComponent(dom.body, component);
            expect(dom.body.textContent).toContain('child say: Hello!Hi!');
        });

        it('updates child render', async () => {
            const childComponent = new ChildComponent('not expected string');
            const component = new ParentComponent(childComponent);
            const dom = configureJSDOM();

            renderComponent(dom.body, component);

            childComponent.say = 'Hi!';

            await waitForPromises();

            expect(dom.body.textContent).toContain('child say: Hi!');
        });

        it('does not renders a killed reference', async () => {
            const childComponent = new ChildComponent('not expected string');
            const component = new ParentComponent(childComponent);
            const dom = configureJSDOM();

            renderComponent(dom.body, component);

            component.childComponent = new ChildComponent('Hi!');
            childComponent.say = 'Killed reference!';

            await waitForPromises();

            expect(dom.body.textContent).toContain('child say: Hi!');
        });

        it('updates new child render after a state change ', async () => {
            const childComponent = new ChildComponent('not expected string of old child');
            const component = new ParentComponent(childComponent);
            const dom = configureJSDOM();

            renderComponent(dom.body, component);

            const newChild = new ChildComponent('not expected string of new child!');
            component.childComponent = newChild;
            newChild.say = 'Hi!';

            childComponent.say = 'Killed reference!';

            await waitForPromises();

            expect(dom.body.textContent).toContain('child say: Hi!');
        });
    })

    describe('when component state change', () => {
        @component()
        class CounterComponent {
            @observing()
            private count: number;

            constructor(count: number) {
                this.count = count;
            }

            render(): Renderable {
                return html`
                    total: ${this.count}!
                `;
            }

            increase(): void {
                this.count++;
            }
        }

        it('renders a property', () => {
            const component = new CounterComponent(0);
            const dom = configureJSDOM();

            renderComponent(dom.body, component);

            expect(dom.body.textContent).toContain('total: 0');
        });

        it('renders a new value when the value changes', async () => {
            const component = new CounterComponent(0);
            const dom = configureJSDOM();

            renderComponent(dom.body, component);
            expect(dom.body.textContent).toContain('total: 0');

            component.increase();
            component.increase();
            component.increase();
            component.increase();

            await waitForPromises();
            expect(dom.body.textContent).toContain('total: 4');
        });
    });

    describe('event hooks', () => {
        describe('@connectedCallback', () => {
            it('calls the connected callback event once', () => {
                const stub = jest.fn();

                @component()
                class HelloWorldComponent {
                    render(): Renderable {
                        return html`Hello, World!`;
                    }

                    @connectedCallback()
                    onConnect(): void {
                        stub();
                    }
                }

                const helloWorldComponent = new HelloWorldComponent();
                const dom = configureJSDOM();

                const div1 = dom.document.createElement('div');
                const div2 = dom.document.createElement('div');

                dom.body.appendChild(div1);
                dom.body.appendChild(div2);

                renderComponent(div1, helloWorldComponent);
                renderComponent(div2, helloWorldComponent);

                expect(stub).toBeCalledTimes(1);
            });
        });

        describe('@connectedCallback', () => {
            it('calls the connected callback event', () => {
                const stub = jest.fn();

                @component()
                class HelloWorldComponent {
                    render(): Renderable {
                        return html`Hello, World!`;
                    }

                    @connectedCallbackNode()
                    onConnect(): void {
                        stub();
                    }

                    @connectedCallbackNode()
                    onConnect2(): void {
                        stub();
                    }
                }

                const helloWorldComponent = new HelloWorldComponent();
                const dom = configureJSDOM();

                const div1 = dom.document.createElement('div');
                dom.body.appendChild(div1);

                const div2 = dom.document.createElement('div');
                dom.body.appendChild(div2);

                renderComponent(div1, helloWorldComponent);
                renderComponent(div2, helloWorldComponent);

                expect(stub).toBeCalledTimes(4);
            });

            it('receives the component node', () => {
                const stub = jest.fn();

                @component()
                class HelloWorldComponent {
                    render(): Renderable {
                        return html`Hello, World!`;
                    }

                    @connectedCallbackNode()
                    onConnect(node: HTMLElementWithJigProperties): void {
                        stub(node);
                    }
                }

                const helloWorldComponent = new HelloWorldComponent();
                const dom = configureJSDOM();

                renderComponent(dom.body, helloWorldComponent);

                const callElement = stub.mock.calls[0][0];

                expect(callElement.textContent).toContain('Hello, World!');
                expect(callElement.parentElement).toBe(dom.body);
                expect(callElement.tagName).toBe('HELLOWORLDCOMPONENT');
            });
        });

        describe('@disconnectedCallbackNode', () => {
            it('calls the disconnect callback', async () => {
                const stub = jest.fn();

                @component()
                class ChildComponent {
                    render(): Renderable {
                        return html`Hello, World!`;
                    }

                    @disconnectedCallbackNode()
                    private onDisconnect(): void {
                        stub();
                    }

                    @disconnectedCallbackNode()
                    private onDisconnect2(): void {
                        stub();
                    }
                }

                const childComponent = new ChildComponent();
                const parent = new ParentComponent(childComponent);
                const dom = configureJSDOM();
                renderComponent(dom.body, parent);

                parent.childComponent = null;

                await waitForPromises();

                expect(stub).toBeCalledTimes(2);
            });

            it('receives the component node', () => {
                const stub = jest.fn();

                @component()
                class HelloWorldComponent {
                    render(): Renderable {
                        return html`Hello, World!`;
                    }

                    @disconnectedCallbackNode()
                    onDisconnect(node: HTMLElementWithJigProperties): void {
                        stub(node);
                    }
                }

                const helloWorldComponent = new HelloWorldComponent();
                const dom = configureJSDOM();

                renderComponent(dom.body, helloWorldComponent);
                render(dom.document.createElement('strong'))(dom.body);

                const callElement = stub.mock.calls[0][0];

                expect(callElement.textContent).toContain('Hello, World!');
                expect(callElement.parentElement).toBe(null);
                expect(callElement.tagName).toBe('HELLOWORLDCOMPONENT');
            });

            it('does not calls disconnect when there are no changes', async () => {
                const stub = jest.fn();

                @component()
                class ChildComponent {
                    render(): Renderable {
                        return html`Hello, World!`;
                    }

                    @disconnectedCallbackNode()
                    private onDisconnect(): void {
                        stub();
                    }
                }

                const childComponent = new ChildComponent();
                const parent = new ParentComponentList([childComponent, childComponent]);
                renderTestComponent(parent);

                parent.childComponents = [childComponent];
                await waitForPromises();
                expect(stub).toBeCalledTimes(1);
                parent.childComponents = [childComponent, childComponent];
                await waitForPromises();
                expect(stub).toBeCalledTimes(1);
            });
        });

        describe('@disconnectCallback', () => {
            it('calls all disconnected after there are no component references', async () => {
                const stub = jest.fn();

                @component()
                class ChildComponent {
                    render(): Renderable {
                        return html`Hello, World!`;
                    }

                    @disconnectedCallback()
                    private onDisconnect(): void {
                        stub();
                    }
                }

                const child = new ChildComponent();
                const parent = new ParentComponentList([child, child]);

                renderTestComponent(parent);

                expect(stub).not.toBeCalled();

                parent.childComponents = [child];
                await waitForPromises();
                expect(stub).not.toBeCalled();

                parent.childComponents = [];
                await waitForPromises();
                expect(stub).toBeCalled();
            });
        });
    });

    describe('when propagate changes', () => {
        @observable()
        class Counter {
            @observing()
            private count = 0;

            increase(): void {
                this.count++
            }

            getValue(): number {
                return this.count;
            }
        }

        @component()
        class CounterComponent {
            @propagate()
            private readonly counter: Counter;

            constructor(counter: Counter) {
                this.counter = counter;
            }

            render(): Renderable {
                return html`
                    <strong>total:</strong> ${this.counter.getValue()}!
                `;
            }
        }

        it('renders a new value when the value changes', async () => {
            const counter = new Counter();
            const component = new CounterComponent(counter);
            const dom = configureJSDOM();

            renderComponent(dom.body, component);
            expect(dom.body.textContent).toContain('total: 0');
            counter.increase()
            await waitForPromises();
            expect(dom.body.textContent).toContain('total: 1');
        });
    });

    describe('render optimization', () => {
        let renderStub;

        beforeEach(() => {
            renderStub = jest.fn();
        });

        @component()
        class MyComponent {
            @observing()
            public x = 1;

            render(): Renderable {
                renderStub();
                return html`${this.x}`;
            }
        }

        it('does not renders after disconnect', async () => {
            const component = new MyComponent();

            const dom = renderTestComponent(component);
            render(dom.document.createElement('strong'))(dom.document.body);
            expect(renderStub).toBeCalledTimes(1);

            component.x++;

            await waitForPromises();

            expect(renderStub).toBeCalledTimes(1);
        });

        it('subscribes again when reconnect', async () => {
            const component = new MyComponent();

            const dom = renderTestComponent(component);
            render(dom.document.createElement('strong'))(dom.document.body);
            renderComponent(dom.document.body, component);

            component.x++;

            await waitForPromises();

            expect(dom.body.textContent).toContain('2');
        });

        it('delays rendering to prevent multiple render calls', async () => {
            const component = new MyComponent();

            const dom = renderTestComponent(component);

            expect(renderStub).toBeCalledTimes(1);

            component.x++;
            component.x++;
            component.x++;

            await waitForPromises();

            expect(renderStub).toBeCalledTimes(2);
            expect(dom.body.textContent).toContain('4');
        });
    });

    describe('rehydrating', () => {
        let stub;

        @component()
        class HelloWorldComponent {
            @observing()
            public name = `World`;

            render(): Renderable {
                return html`Hello, ${this.name}!`;
            }

            @connectedCallback()
            onConnect(): void {
                stub();
            }
        }

        beforeEach(() => {
            stub = jest.fn();
        });

        it('calls connect callback when rehydrate', () => {
            const component = new HelloWorldComponent();
            const dom = configureJSDOM();
            dom.body.innerHTML = "<helloworldcomponent>Hello, World!</helloworldcomponent>";

            renderComponent(dom.body, component);

            expect(stub).toBeCalledTimes(1);
        });

        it('updates the content', async () => {
            const component = new HelloWorldComponent();
            const dom = configureJSDOM();
            dom.body.innerHTML = "<helloworldcomponent>Hello, World!</helloworldcomponent>";

            renderComponent(dom.body, component);

            component.name = 'Universe';

            await waitForPromises();

            expect(dom.body.textContent).toContain('Universe');
        });
    });
});

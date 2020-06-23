import {
    allDisconnectedCallback,
    connectedCallback,
    disconnectedCallback,
    html,
    pureComponent,
    renderComponent,
    RenderableComponent
} from "../pure-component";
import {configureJSDOM} from "../../core/dom";
import {Renderable} from "../../template/render";
import {propagateSideEffects, sideEffect} from "../../side-effect/side-effect";

@pureComponent()
class ParentComponent {
    constructor(public childComponent: RenderableComponent) {
    }

    render(): Renderable {
        return html`child say: ${this.childComponent}`;
    }
}

@pureComponent()
class ParentComponentList {
    constructor(public childComponents: RenderableComponent[]) {
    }

    render(): Renderable {
        return html`child say: ${this.childComponents}`;
    }
}

function renderTestComponent(parent: ParentComponentList) {
    const dom = configureJSDOM();
    renderComponent(dom.body, parent);
    return dom;
}

describe('@pureComponent', () => {
    it('renders a simple component', () => {
        @pureComponent()
        class HelloWorldComponent {
            render(): Renderable {
                return html`Hello, World!`;
            }
        }

        const component = new HelloWorldComponent();
        const dom = configureJSDOM();

        renderComponent(dom.body, component);

        expect(dom.body.textContent).toContain('Hello, World!');
    });

    describe('rendering child components', () => {
        @pureComponent()
        class ChildComponent {
            constructor(public say: string) {
            }

            render(): Renderable {
                return html`${this.say}`;
            }
        }

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

        it('updates child render', () => {
            const childComponent = new ChildComponent('not expected string');
            const component = new ParentComponent(childComponent);
            const dom = configureJSDOM();

            renderComponent(dom.body, component);

            childComponent.say = 'Hi!';

            expect(dom.body.textContent).toContain('child say: Hi!');
        });

        it('updates child render', () => {
            const childComponent = new ChildComponent('not expected string');
            const component = new ParentComponent(childComponent);
            const dom = configureJSDOM();

            renderComponent(dom.body, component);

            component.childComponent = new ChildComponent('Hi!');
            childComponent.say = 'Killed reference!';

            expect(dom.body.textContent).toContain('child say: Hi!');
        });

        it('updates new child render after a state change ', () => {
            const childComponent = new ChildComponent('not expected string of old child');
            const component = new ParentComponent(childComponent);
            const dom = configureJSDOM();

            renderComponent(dom.body, component);

            const newChild = new ChildComponent('not expected string of new child!');
            component.childComponent = newChild;
            newChild.say = 'Hi!';

            childComponent.say = 'Killed reference!';

            expect(dom.body.textContent).toContain('child say: Hi!');
        });
    })

    describe('when component state change', () => {
        @pureComponent()
        class CounterComponent {
            constructor(private count: number) {
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

        it('renders a new value when the value changes', () => {
            const component = new CounterComponent(0);
            const dom = configureJSDOM();

            renderComponent(dom.body, component);
            expect(dom.body.textContent).toContain('total: 0');

            component.increase();
            component.increase();
            component.increase();
            component.increase();
            expect(dom.body.textContent).toContain('total: 4');
        });
    });

    describe('event hooks', () => {
        describe('@connectedCallback', () => {
            it('calls the connected callback event', () => {
                const stub = jest.fn();
                @pureComponent()
                class HelloWorldComponent {
                    render(): Renderable {
                        return html`Hello, World!`;
                    }

                    @connectedCallback()
                    onConnect(): void {
                        stub();
                    }

                    @connectedCallback()
                    onConnect2(): void {
                        stub();
                    }
                }

                const component = new HelloWorldComponent();
                const dom = configureJSDOM();
                renderComponent(dom.body, component);

                expect(stub).toBeCalledTimes(2);
            });
        });

        describe('@disconnectedCallback', () => {
            it('calls the disconnect callback', () => {
                const stub = jest.fn();
                @pureComponent()
                class ChildComponent {
                    render(): Renderable {
                        return html`Hello, World!`;
                    }

                    @disconnectedCallback()
                    private onDisconnect(): void {
                        stub();
                    }

                    @disconnectedCallback()
                        private onDisconnect2(): void {
                        stub();
                    }
                }

                const component = new ChildComponent();
                const parent = new ParentComponent(component);
                const dom = configureJSDOM();
                renderComponent(dom.body, parent);

                parent.childComponent = null;

                expect(stub).toBeCalledTimes(2);
            });

            it('does not calls disconnect when there are no changes', () => {
                const stub = jest.fn();
                @pureComponent()
                class ChildComponent {
                    render(): Renderable {
                        return html`Hello, World!`;
                    }

                    @disconnectedCallback()
                    private onDisconnect(): void {
                        stub();
                    }
                }

                const component = new ChildComponent();
                const parent = new ParentComponentList([component, component]);
                renderTestComponent(parent);

                parent.childComponents = [component];
                expect(stub).toBeCalledTimes(1);
                parent.childComponents = [component, component];
                expect(stub).toBeCalledTimes(1);
            });
        });

        describe('@allDisconnectedCallback', () => {
            it('calls all disconnected after there are no component references', () => {
                const stub = jest.fn();

                @pureComponent()
                class ChildComponent {
                    render(): Renderable {
                        return html`Hello, World!`;
                    }

                    @allDisconnectedCallback()
                    private onDisconnect(): void {
                        stub();
                    }
                }

                const child = new ChildComponent();
                const parent = new ParentComponentList([child, child]);

                renderTestComponent(parent);

                expect(stub).not.toBeCalled();
                parent.childComponents = [child];

                expect(stub).not.toBeCalled();
                parent.childComponents = [];

                expect(stub).toBeCalled();
            });
        });
    });

    describe('when propagate changes', () => {
        @sideEffect()
        class Counter {
            private count = 0;

            increase(): void {
                this.count++
            }

            getValue(): number {
                return this.count;
            }
        }

        @pureComponent()
        class CounterComponent {
            @propagateSideEffects()
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

        it('renders a new value when the value changes', () => {
            const counter = new Counter();
            const component = new CounterComponent(counter);
            const dom = configureJSDOM();

            renderComponent(dom.body, component);
            expect(dom.body.textContent).toContain('total: 0');
            counter.increase()
            expect(dom.body.textContent).toContain('total: 1');
        });
    });
})

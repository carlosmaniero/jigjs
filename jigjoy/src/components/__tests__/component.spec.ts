import '../../core/register';
import * as testingLibrary from '@testing-library/dom'
import {render} from "../../testing/utils";
import {Component, html, RehydrateService, RenderResult} from "../component";
import waitForExpect from "wait-for-expect";
import {ServerRehydrateService} from "../server/server-rehydrate-service";
import {JSDOM} from "jsdom";

describe('Component', () => {
    it('renders a hello world component', () => {
        const component = render(new class extends Component {
            selector: string = "component-custom";

            render(): RenderResult {
                const htmlElement = document.createElement('div');
                htmlElement.innerHTML = "Hello, World";
                return htmlElement;
            }
        });

        expect(component.getByText("Hello, World")).not.toBeNull();
    });

    it('renders component props', () => {
        const component = render(new class extends Component {
            observedAttributes = ['name'];
            selector: string = "component-custom";

            render(): RenderResult {
                return html`Hello, ${this.props.name}`
            }
        }, {template: `<component-custom name="World"></component-custom>`});

        expect(component.getByText("Hello, World")).not.toBeNull();
    });

    it('updates content after a attribute update', async () => {
        const body = render(new class extends Component {
            observedAttributes = ['name'];
            selector: string = "component-custom";

            render(): RenderResult {
                return html`Hello, ${this.props.name}`
            }
        }, {template: `<component-custom name="World"></component-custom>`});

        body.element.querySelector('component-custom').setAttribute('name', 'Universe');

        expect(body.getByText("Hello, Universe")).not.toBeNull();
    });

    it('has a mount callback', async () => {
        const component = render(new class extends Component {
            public readonly selector: string = "component-custom";
            protected observedAttributes = ['name'];
            private name: string

            render(): RenderResult {
                return html`Hello, ${this.name}`
            }

            mount() {
                this.name = 'World';
            }
        });

        expect(component.getByText("Hello, World")).not.toBeNull();
    });

    it('calls the unmount when element is removed from dom', async () => {
        const mockUnmount = jest.fn();

        const component = render(new class extends Component {
            public readonly selector: string = "component-custom";
            protected observedAttributes = ['name'];

            render(): RenderResult {
                return html`Hello`
            }

            unmount() {
                mockUnmount();
            }
        });
        expect(mockUnmount).not.toBeCalled();
        component.element.ownerDocument.body.innerHTML = "";
        expect(mockUnmount).toBeCalled();
    });

    it('changes renders the component when the state changes', async () => {
        const component = render(new class extends Component<{name: string}> {
            state = {
                name: 'no-name'
            };
            readonly selector: string = "component-custom";

            render(): RenderResult {
                return html`Hello, ${this.state.name}`
            }

            mount() {
                setImmediate(() => {
                    this.setState({name: 'World'})
                });
            }
        });

        await waitForExpect(() => {
            expect(component.getByText('Hello, World')).not.toBeNull();
        })
    });

    it('has a way to update the render result programmatically for async actions', async () => {
        const component = render(new class extends Component {
            public readonly selector: string = "component-custom";
            protected observedAttributes = ['name'];
            private name: string;

            render(): RenderResult {
                return html`Hello, ${this.name}`
            }

            mount() {
                setImmediate(() => {
                    this.name = 'World'
                    this.updateRender();
                });
            }
        });

        await waitForExpect(() => {
            expect(component.getByText('Hello, World')).not.toBeNull();
        })
    });

    it('has a way to update the render result programmatically for async actions', async () => {
        const component = render(new class extends Component {
            public readonly selector: string = "component-custom";
            protected observedAttributes = ['name'];
            private name: string;

            render(): RenderResult {
                return html`Hello, ${this.name}`
            }

            mount() {
                setImmediate(() => {
                    this.name = 'World'
                    this.updateRender();
                });
            }
        });

        await waitForExpect(() => {
            expect(component.getByText('Hello, World')).not.toBeNull();
        })
    });

    it('throws an exception when updateRender is called at the constructor', async () => {
        expect(() => render(new class extends Component {

            public readonly selector: string = "component-custom";

            constructor() {
                super();
                this.updateRender();
            }

            render(): RenderResult {
                return undefined;
            }
        })).toThrowError(new Error('Update render could not be called before mount()'));
    });

    it('pushes the render result into rehydration service', async () => {
        const rehydrateService: RehydrateService = new ServerRehydrateService();

        const component = render(new class extends Component<{name: string}> {

            public readonly selector: string = "component-custom";

            constructor() {
                super(rehydrateService);
            }

            mount() {
                this.setState({name: 'World'});
            }

            render(): RenderResult {
                return html`Hey!`
            }
        });

        const contextName = component.element.getAttribute('rehydrate-context-name');

        expect(rehydrateService.getContext(contextName)).toEqual({name: 'World'});
    });

    describe('when rehydrate', () => {
        let dom;
        let originalDiv: HTMLDivElement;
        let componentInstance: Component<{name: string}>;
        let rehydrateMock;

        beforeEach(() => {
            const rehydrateService: RehydrateService = new ServerRehydrateService();
            rehydrateService.updateContext("0", {name: 'World'});
            rehydrateMock = jest.fn();

            class MyComponent extends Component<{ name: string }> {
                public readonly selector: string = "component-custom";
                state = {
                    name: 'no-name'
                };

                constructor() {
                    super(rehydrateService);
                }

                render(): RenderResult {
                    return html`<div>Hello, ${this.state.name}</div>`
                }

                rehydrate(state: { name: string }) {
                    super.rehydrate(state);

                    rehydrateMock()
                }
            }

            dom = new JSDOM();

            dom.window.document.body.innerHTML =
                '<component-custom rehydrate-context-name="0"><div>Hello, World</div></component-custom>'

            originalDiv = dom.window.document.querySelector('div');

            componentInstance = new MyComponent();
            componentInstance.registerCustomElementClass(dom.window as any);
        })

        it('renders the content of rehydration', async () => {
            await waitForExpect(() => {
                expect(testingLibrary.getAllByText(dom.window.document.body, "Hello, World")).toHaveLength(1);
            });
        });

        it('keep the innerHtml', () => {
            expect(dom.window.document.querySelector('div') === originalDiv).toBeTruthy();
        });

        it('updates the state with the context', () => {
            expect(componentInstance.state).toEqual({name: 'World'});
        });

        it('calls the rehydrate when rehydrate', () => {
            expect(rehydrateMock).toBeCalled();
        });
    });
})

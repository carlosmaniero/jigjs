import '../../core/register';
import {render} from "../../testing/utils";
import {Component, html, RenderResult} from "../component";

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

    it('has a way to update the render result programmatically for async actions', (done) => {
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

        setImmediate(() => {
            expect(component.getByText('Hello, World')).not.toBeNull();
            done();
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
})

import {html as lighterHtml, render, Renderable} from 'lighterhtml';

export type RenderResult = Renderable;

export const html = lighterHtml;

export type JigJoyWindow = Window & {
    HTMLElement: typeof HTMLElement
}

export abstract class Component {
    public abstract readonly selector: string;
    protected observedAttributes: string[];
    private _updateRender: () => void;

    private _props: Readonly<Record<string, string>>;

    protected get props(): Record<string, string> {
        return this._props;
    }

    abstract render(): RenderResult;

    mount() {
    }

    unmount() {
    }

    updateRender() {
        if (!this._updateRender) {
            throw new Error('Update render could not be called before mount()');
        }
        this._updateRender();
    }

    public registerCustomElementClass(window: JigJoyWindow) {
        const component = this;
        const observableKeys = component.observedAttributes;

        window.customElements.define(this.selector, class extends window.HTMLElement {
            private readonly updateRender: () => void;

            constructor() {
                super();

                this.updateRender = render.bind(
                    null,
                    this,
                    this.render.bind(this)
                );
                component._updateRender = this.updateRender;
            }

            static get observedAttributes() {
                return observableKeys;
            }

            connectedCallback() {
                component._props = this.getAttributeNames()
                    .reduce((props, propKey) => ({
                        ...props,
                        [propKey]: this.getAttribute(propKey)
                    }), {}) as any;

                component.mount();

                this.updateRender();
            }

            disconnectedCallback() {
                component.unmount();
            }

            attributeChangedCallback(name, oldValue, newValue) {
                component._props = {
                    ...component._props,
                    [name]: newValue
                }
                this.updateRender();
            }

            render() {
                return component.render();
            }
        })
    }
}

import {html as lighterHtml, render, Renderable} from 'lighterhtml';

export type RenderResult = Renderable;

export const html = lighterHtml;

export type JigJoyWindow = Window & {
    HTMLElement: typeof HTMLElement
}

export interface RehydrateService {
    createContext(): string;
    updateContext<T>(contextName: string, object: T): void;
    getContext<T>(contextName: string): T;
}

export const RehydrateService = {
    InjectionToken: 'RehydrateService'
}

export abstract class Component<T={}> {
    state: T;
    private readonly contextName: string;

    constructor(private readonly rehydrateService?: RehydrateService) {
        if (this.rehydrateService) {
            this.contextName = this.rehydrateService.createContext();
        }
    }

    public abstract readonly selector: string;
    protected readonly observedAttributes: string[];
    private _updateRender: () => void;

    private _props: Readonly<Record<string, string>>;

    protected setState(partialState: Partial<T>) {
        this.state = {...this.state, ...partialState};
        this.updateRender();

        if (this.rehydrateService) {
            this.rehydrateService.updateContext(this.contextName, this.state);
        }
    }

    protected get props(): Record<string, string> {
        return this._props;
    }

    abstract render(): RenderResult;

    mount() {
    }

    unmount() {
    }

    rehydrate(state: T) {
        this.state = state;
    }

    updateRender() {
        if (!this._updateRender) {
            throw new Error('Update render could not be called before mount()');
        }
        this._updateRender();
    }

    public registerCustomElementClass(window: JigJoyWindow) {
        const originalComponent = this;
        const observableKeys = originalComponent.observedAttributes;

        window.customElements.define(this.selector, class extends window.HTMLElement {
            private readonly updateRender: () => void;

            private readonly REHYDRATE_CONTEXT_ATTRIBUTE_NAME = 'rehydrate-context-name';
            private readonly componentInstance: Component<unknown>;

            constructor() {
                super();

                this.componentInstance = this.createComponentInstance();

                this.updateRender = render.bind(
                    null,
                    this,
                    this.render.bind(this)
                );

                this.componentInstance._updateRender = this.updateRender;
            }

            static get observedAttributes() {
                return observableKeys;
            }

            connectedCallback() {
                this.componentInstance._props = this.getAttributeNames()
                    .reduce((props, propKey) => ({
                        ...props,
                        [propKey]: this.getAttribute(propKey)
                    }), {}) as any;

                if (this.hasAttribute(this.REHYDRATE_CONTEXT_ATTRIBUTE_NAME)) {
                    this.componentInstance.rehydrate(this.getContext());
                    return;
                }

                if (this.componentInstance.contextName) {
                    this.setAttribute(this.REHYDRATE_CONTEXT_ATTRIBUTE_NAME, this.componentInstance.contextName);

                }

                this.componentInstance.mount();

                this.updateRender();
            }

            private getContext(): T {
                return this.componentInstance.rehydrateService.getContext(this.getAttribute(this.REHYDRATE_CONTEXT_ATTRIBUTE_NAME));
            }

            disconnectedCallback() {
                this.componentInstance.unmount();
            }

            attributeChangedCallback(name, oldValue, newValue) {
                this.componentInstance._props = {
                    ...this.componentInstance._props,
                    [name]: newValue
                }
                this.updateRender();
            }

            render() {
                return this.componentInstance.render();
            }

            private createComponentInstance() {
                const instance = new (originalComponent.constructor as { new (): Component<unknown> })();
                Object.assign(instance, originalComponent);
                return instance;
            }
        })
    }
}

import {Renderable} from "../template/render";
import {RehydrateData} from "./component";

type RequiredComponentMethods = {
    render: () => Renderable;
    mount?: () => void;
    unmount?: () => void;
    rehydrate?: (props: Record<string, unknown>, state: Record<string, unknown>) => void;
    shouldUpdate?: () => boolean;
    afterRender?: () => void;
    flushRehydration?: () => RehydrateData;
    propsChanged?: (oldProps: unknown) => void;
    shouldRenderAfterRehydrate?: () => boolean;
}

type RehydrationContext = {
    state: Record<string, unknown>;
    props: Record<string, unknown>;
};

interface CustomElementsInterface<T> {
    preRenderContext?: RehydrationContext;
    updateRender: (renderable: Renderable) => void;
    stateKey: string;
    propsKeys: string[];
    initialProps: Record<string, unknown>;
}

export class ComponentLifecycle<T extends RequiredComponentMethods> {
    constructor(private readonly componentInstance: T,
                private readonly customElementsInterface: CustomElementsInterface<T>) {
    }

    start(): void {
        this.applyComponentInstanceProps(this.customElementsInterface.initialProps);

        if (this.isPreRender()) {
            this.rehydrate();
        }

        this.mount();
        this.updateRender();
        this.flushRehydrate();
    }

    onPropsChanged(props: Record<string, unknown>, oldProps: Record<string, unknown>): void {
        this.applyComponentInstanceProps(props);
        this.propsChanged(oldProps);
        this.updateRender();
    }

    onStateChange(): void {
        this.updateRender();
        this.flushRehydrate();
    }

    unmount(): void {
        this.componentInstance.unmount && this.componentInstance.unmount();
    }

    private afterRender(): void {
        this.componentInstance.afterRender && this.componentInstance.afterRender();
    }

    private isPreRender(): boolean {
        return !!this.customElementsInterface.preRenderContext;
    }

    private render(): Renderable {
        return this.componentInstance.render();
    }

    private updateRender(): void {
        if (!this.shouldUpdate()) {
            return;
        }
        this.customElementsInterface.updateRender(this.render());
        this.afterRender();
    }

    private mount(): void {
        this.componentInstance.mount && this.componentInstance.mount();
    }

    private rehydrate(): void {
        const {props, state} = this.customElementsInterface.preRenderContext;

        if (this.componentInstance.rehydrate) {
            this.componentInstance.rehydrate(props, state);

            return;
        }

        this.defaultRehydrate(props, state);
    }

    private shouldUpdate(): boolean {
        if (this.componentInstance.shouldUpdate) {
            return this.componentInstance.shouldUpdate();
        }

        return true;
    }

    private propsChanged(oldProps: unknown): void {
        this.componentInstance.propsChanged && this.componentInstance.propsChanged(oldProps);
    }

    private defaultRehydrate(props: Record<string, unknown>, state: Record<string, unknown>): void {
        this.setComponentInstanceState(state);
        this.applyComponentInstanceProps(props);
    }

    private applyComponentInstanceProps(props: Record<string, unknown>): void {
        const expectedProps: string[] = this.customElementsInterface.propsKeys;
        const currentProps = {};

        expectedProps.forEach((propName) => {
            if (propName in props) {
                this.componentInstance[propName] = props[propName];
                currentProps[propName] = props[propName];
                return;
            }
        });
    }

    private setComponentInstanceState(state: Record<string, unknown>): void {
        this.componentInstance[this.customElementsInterface.stateKey] = state;
    }

    private flushRehydrate(): void {
        if (this.componentInstance.flushRehydration) {
            this.customElementsInterface.preRenderContext = this.componentInstance.flushRehydration();
            return;
        }
        this.customElementsInterface.preRenderContext = {
            props: this.defaultPropsRehydrationFlush(),
            state: this.defaultStateRehydrationFlush()
        }
    }

    private defaultPropsRehydrationFlush(): Record<string, unknown> {
        return this.customElementsInterface.propsKeys.reduce((acc, propName) => {
            return {...acc, [propName]: this.componentInstance[propName]}
        }, {});
    }

    private defaultStateRehydrationFlush(): Record<string, unknown> {
        return this.componentInstance[this.customElementsInterface.stateKey];
    }
}

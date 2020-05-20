import {Renderable} from "../template/render";

type RequiredComponentMethods = {
    render: () => Renderable;
    mount?: () => void;
    unmount?: () => void;
    rehydrate?: () => void;
    shouldUpdate?: () => boolean;
    afterRender?: () => void;
    propsChanged?: (oldProps: unknown) => void;
    shouldRenderAfterRehydrate?: () => boolean;
}

export class ComponentLifecycle<T extends RequiredComponentMethods> {
    constructor(private readonly componentInstance: T) {
    }

    render(): Renderable {
        return this.componentInstance.render();
    }

    afterRender(): void {
        this.componentInstance.afterRender && this.componentInstance.afterRender();
    }

    mount(): void {
        this.componentInstance.mount && this.componentInstance.mount();
    }

    unmount(): void {
        this.componentInstance.unmount && this.componentInstance.unmount();
    }

    rehydrate(): void {
        this.componentInstance.rehydrate && this.componentInstance.rehydrate();
    }

    shouldUpdate(): boolean {
        if (this.componentInstance.shouldUpdate) {
            return this.componentInstance.shouldUpdate();
        }

        return true;
    }

    shouldRenderAfterRehydrate(): boolean {
        if (this.componentInstance.shouldRenderAfterRehydrate) {
            return this.componentInstance.shouldRenderAfterRehydrate();
        }

        return true;
    }


    propsChanged(oldProps: unknown): void {
        this.componentInstance.propsChanged && this.componentInstance.propsChanged(oldProps);
    }
}

import {Renderable} from "../template/render";

interface OnMount {
    mount: () => void;
}

interface OnUnmount {
    unmount: () => void;
}

interface OnRehydrate {
    rehydrate: () => void;
}

interface ShouldUpdate {
    shouldUpdate: () => boolean;
}

interface AfterRender {
    afterRender: () => void;
}

interface ShouldRenderAfterRehydrate {
    shouldRenderAfterRehydrate: () => boolean;
}

type RequiredComponentMethods = {
    render: () => Renderable;
} & (
    OnMount |
    OnUnmount |
    OnRehydrate |
    ShouldUpdate |
    ShouldRenderAfterRehydrate |
    AfterRender |
    {});

export class ComponentLifecycle<T extends RequiredComponentMethods> {
    constructor(private readonly componentInstance: T) {
    }

    render(): Renderable {
        return this.componentInstance.render();
    }

    afterRender(): void {
        if (this.hasAfterRenderMethod(this.componentInstance)) {
            this.componentInstance.afterRender();
        }
    }

    mount(): void {
        if (this.hasMountMethod(this.componentInstance)) {
            this.componentInstance.mount();
        }
    }

    unmount(): void {
        if (this.hasUnmountMethod(this.componentInstance)) {
            this.componentInstance.unmount();
        }
    }

    rehydrate(): void {
        if (this.hasRehydrateMethod(this.componentInstance)) {
            this.componentInstance.rehydrate();
        }
    }

    shouldUpdate(): boolean {
        if (this.hasShouldUpdateMethod(this.componentInstance)) {
            return this.componentInstance.shouldUpdate();
        }

        return true;
    }

    shouldRenderAfterRehydrate(): boolean {
        if (this.hasShouldRenderAfterRehydrate(this.componentInstance)) {
            return this.componentInstance.shouldRenderAfterRehydrate();
        }

        return true;
    }

    private hasMountMethod(componentInstance: T): componentInstance is T & OnMount {
        return 'mount' in componentInstance;
    }

    private hasUnmountMethod(componentInstance: T): componentInstance is T & OnUnmount {
        return 'unmount' in componentInstance;
    }

    private hasRehydrateMethod(componentInstance: T): componentInstance is T & OnRehydrate {
        return 'rehydrate' in componentInstance;
    }

    private hasShouldUpdateMethod(componentInstance: T): componentInstance is T & ShouldUpdate {
        return 'shouldUpdate' in componentInstance;
    }

    private hasShouldRenderAfterRehydrate(componentInstance: T): componentInstance is T & ShouldRenderAfterRehydrate {
        return 'shouldRenderAfterRehydrate' in componentInstance;
    }

    private hasAfterRenderMethod(componentInstance: T): componentInstance is T & AfterRender {
        return 'afterRender' in componentInstance;
    }
}

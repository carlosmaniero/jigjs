import {Container as InversifyContainer, inject, injectable, interfaces} from "inversify";
import ServiceIdentifier = interfaces.ServiceIdentifier;

export interface ClassProvider<T> {
    useClass: constructor<T>;
}

export interface ValueProvider<T> {
    useValue: T;
}

export type constructor<T> = {
    new (...args: any[]): T;
};

export type TInjectionToken<T = any> = constructor<T> | string | symbol;

export const GlobalInjectable = injectable;

export const Inject = inject;

export class Container {
    private container: InversifyContainer;

    constructor(private readonly parentContainer?: Container) {
        this.setContainer();
    }

    createChildContainer() {
        return new Container(this);
    }

    isRegistered<T>(token: ServiceIdentifier<T>): boolean {
        return this.container.isBound(token);
    }

    private setContainer(): void {
        this.container = new InversifyContainer();

        if (this.parentContainer) {
            this.container.parent = this.parentContainer.container;
        }
    }

    register<T>(token: DIInjectionToken<T> | string, provider: constructor<T>): void;
    register<T>(token: DIInjectionToken<T> | string, provider: {useClass: constructor<T>}): void;
    register<T>(token: DIInjectionToken<T> | string, provider: {useValue: T}): void;
    register(token, provider): void {
        const providerClass = provider.useClass || provider;
        const isSingleton = (providerClass as any).isSingleton;

        if (isSingleton) {
            this.registerSingleton(token, providerClass);
            return;
        }

        if (provider.useValue) {
            this.registerInstance(token, provider.useValue);
            return;
        }

        if (provider.useClass) {
            this.container.bind(token).to(provider.useClass);
            return;
        }

        this.container.bind(token).to(provider);
    }

    registerInstance<T>(token: TInjectionToken<T>, instance: T): void {
        this.container.bind(token).toConstantValue(instance);
    }

    registerSingleton<T>(token: constructor<T>): void;
    registerSingleton<T>(token: DIInjectionToken<T>, to: constructor<T>): void;
    registerSingleton(toBind, to?): void {
        if (to) {
            this.container.bind(to).toSelf().inSingletonScope();
            if (toBind !== to) {
                this.registerInstance(toBind, this.resolve(to));
            }
            return;
        }

        this.container.bind(toBind).toSelf().inSingletonScope();
    }

    registerAbsent<T>(token: TInjectionToken<T>, provider: {useValue: T});
    registerAbsent<T>(token: TInjectionToken<T>, provider: {useClass: constructor<T>});
    registerAbsent<T>(token: TInjectionToken<T>, provider: constructor<T>);
    registerAbsent(token, provider): void {
        if (this.isRegistered(token)) {
            return;
        }
        this.register(token, provider);
    }

    reset(): void {
        this.setContainer();
    }

    resolve<T>(token: TInjectionToken<T>): T {
        return this.container.get(token);
    }

    resolveAll<T>(token: TInjectionToken<T>): T[] {
        return this.container.getAll(token);
    }

    unregister<T>(token: TInjectionToken<T>): void {
        if (this.isRegistered(token)) {
            this.container.unbind(token);
        }
    }
}

export const globalContainer = new Container();

export type DIRegistration<T> = ValueProvider<T> | ClassProvider<T> | constructor<T>
export type DIInjectionToken<T> = TInjectionToken<T> | constructor<T>;

type Constructor<T> = {
    new(...args: any[]): T;
};
type InjectionToken = string | { InjectionToken: string };

type ClassToBeInjectable<T> = {
    injectableClass: Constructor<T>;
    injectionTokens: InjectionToken[];
    singleton: boolean;
}
const toBeInjectable: ClassToBeInjectable<unknown>[] = [];

export const Injectable = (injectionTokens: InjectionToken[] = []) => (injectableClass) => {
    toBeInjectable.push({
        injectableClass,
        injectionTokens,
        singleton: false
    });
    return GlobalInjectable()(injectableClass);
}
export const Singleton = (injectionTokens: InjectionToken[] = []) => (injectableClass) => {
    toBeInjectable.push({
        injectableClass,
        injectionTokens,
        singleton: true
    });
    injectableClass.isSingleton = true;
    return Injectable()(injectableClass);
}

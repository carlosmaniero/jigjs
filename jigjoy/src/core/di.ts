import {container, inject, injectable, InjectionToken as TInjectionToken, singleton, TokenProvider} from "tsyringe";
import ValueProvider from "tsyringe/dist/typings/providers/value-provider";
import FactoryProvider from "tsyringe/dist/typings/providers/factory-provider";
import ClassProvider from "tsyringe/dist/typings/providers/class-provider";
import constructor from "tsyringe/dist/typings/types/constructor";
import DependencyContainer from "tsyringe/dist/typings/types/dependency-container";

export const GlobalInjectable = injectable;

export const Inject = inject;

export class Container {
    constructor(private readonly container: DependencyContainer) {
        container.register<Container>(Container, {useValue: this});
    }

    createChildContainer() {
        return new Container(this.container.createChildContainer());
    }

    isRegistered<T>(token: TInjectionToken<T>, recursive?: boolean): boolean {
        return this.container.isRegistered(token, recursive);
    }

    register<T>(token: TInjectionToken<T>, provider: ValueProvider<T>): DependencyContainer;
    register<T>(token: TInjectionToken<T>, provider: FactoryProvider<T>): DependencyContainer;
    register<T>(token: TInjectionToken<T>, provider: TokenProvider<T>, options?: RegistrationOptions): DependencyContainer;
    register<T>(token: TInjectionToken<T>, provider: ClassProvider<T>, options?: RegistrationOptions): DependencyContainer;
    register<T>(token: TInjectionToken<T>, provider: constructor<T>, options?: RegistrationOptions): DependencyContainer;
    register(token, provider, options?: RegistrationOptions): DependencyContainer {
        return this.container.register(token as any, provider as any, options as any);
    }

    registerInstance<T>(token: TInjectionToken<T>, instance: T): DependencyContainer {
        return this.container.registerInstance(token, instance);
    }

    registerSingleton<T>(from: TInjectionToken<T>, to: TInjectionToken<T>): DependencyContainer;
    registerSingleton<T>(token: constructor<T>): DependencyContainer;
    registerSingleton(from, to?): DependencyContainer {
        return this.container.registerSingleton(from, to);
    }

    reset(): void {
        this.container.reset();
    }

    resolve<T>(token: TInjectionToken<T>): T {
        if (this.isRegistered(token, true)) {
            return this.container.resolve(token);
        }
        throw new Error(`Could not resolve ${token.toString()}. Is it registered?`);
    }

    resolveAll<T>(token: TInjectionToken<T>): T[] {
        return this.container.resolveAll<T>(token);
    }
}

export const globalContainer: any = new Container(container);

export type DIRegistration<T> = ValueProvider<T> | FactoryProvider<T> | ClassProvider<T> | constructor<T>
export type DIInjectionToken<T> = TInjectionToken<T>;

type Constructor<T> = {
    new(...args: any[]): T;
};
type InjectionToken = string | { InjectionToken: string };

type ClassToBeInjectable<T> = {
    injectableClass: Constructor<T>,
    injectionTokens: InjectionToken[],
    singleton: boolean
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
    return singleton()(injectableClass);
}

function getInjectionToken(token: InjectionToken) : string {
    if (typeof token === 'string') {
        return token;
    }
    return token.InjectionToken;
}

export const registerContextualDependencies = (requestContainer: Container) => {
    toBeInjectable.forEach((requestInjectable) => {
        if (requestInjectable.singleton) {
            requestContainer.registerSingleton(requestInjectable.injectableClass)
            requestInjectable.injectionTokens.forEach((token) => {
                // Issue: https://github.com/microsoft/tsyringe/issues/27
                requestContainer
                    .registerInstance(getInjectionToken(token), requestContainer.resolve(requestInjectable.injectableClass));
            });
            return;
        }
        requestContainer.register(requestInjectable.injectableClass, {useClass: requestInjectable.injectableClass});

        requestInjectable.injectionTokens.forEach((token) => {
            requestContainer.register(getInjectionToken(token), requestInjectable.injectableClass);
        });
    });
}

import {container, inject, injectable, InjectionToken as TInjectionToken, singleton} from "tsyringe";
import ValueProvider from "tsyringe/dist/typings/providers/value-provider";
import FactoryProvider from "tsyringe/dist/typings/providers/factory-provider";
import ClassProvider from "tsyringe/dist/typings/providers/class-provider";
import constructor from "tsyringe/dist/typings/types/constructor";
import DependencyContainer from "tsyringe/dist/typings/types/dependency-container";

export const GlobalInjectable = injectable;

export const Inject = inject;

export const DIContainer = container

export type DIContainer = DependencyContainer;
export type DIRegistration<T> = ValueProvider<T> | FactoryProvider<T> | ClassProvider<T> | constructor<T>
export type DIInjectionToken<T> = TInjectionToken<T>;

type Constructor<T> = {
    new(...args: any[]): T;
};
type InjectionToken = string | {InjectionToken: string};

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

export const registerContextualDependencies = (requestContainer: DIContainer) => {
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

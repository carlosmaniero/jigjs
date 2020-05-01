import {container, inject, injectable, InjectionToken} from "tsyringe";
import ValueProvider from "tsyringe/dist/typings/providers/value-provider";
import FactoryProvider from "tsyringe/dist/typings/providers/factory-provider";
import ClassProvider from "tsyringe/dist/typings/providers/class-provider";
import constructor from "tsyringe/dist/typings/types/constructor";
import DependencyContainer from "tsyringe/dist/typings/types/dependency-container";

export const Injectable = injectable;

export const Inject = inject;

export const DIContainer = container;
export type DIContainer = DependencyContainer;
export type DIRegistration<T> = ValueProvider<T> | FactoryProvider<T> | ClassProvider<T> | constructor<T>
export type DIInjectionToken<T> = InjectionToken<T>;

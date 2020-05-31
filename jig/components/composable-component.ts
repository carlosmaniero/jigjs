import {AnyComponent, Component, componentFactoryMetadata, propsMetadata} from "./component";
import {constructor, Container, Inject, Injectable} from "../core/di";

const ComponentSubjectInjectionToken = 'ComponentSubjectInjectionToken';

type PropertyDecorator = (target: unknown, targetKey: string, index?: number | undefined) => void;

export const Subject = (): PropertyDecorator =>
    (target: any, targetKey: string, index?: number | undefined): void => {
        Reflect.defineMetadata("design:type", targetKey, target, "jig:compose:subject");
        Inject(ComponentSubjectInjectionToken)(target, targetKey, index);
    };

const createComponentPropsProxy = <T>(props: string[], component: AnyComponent): void => {
    const subjectKey: string = Reflect.getMetadata("design:type", component.prototype, "jig:compose:subject");

    props.forEach((prop) => {
        Object.defineProperty(component.prototype, prop, {
            get(): unknown {
                return this[`__jig__prop__composable__${prop}`];
            },
            set(value: unknown) {
                this[subjectKey][prop] = value;
                this[`__jig__prop__composable__${prop}`] = value;
            }
        });
    });
}

const setupContainer = <T>(subject: constructor<T>): void => {
    Injectable()(subject);
}

const setupProps = <T>(subject: constructor<T>, component: AnyComponent): void => {
    const props = propsMetadata.getProps(subject.prototype);
    propsMetadata.setProps(component.prototype, props);

    createComponentPropsProxy(props, component);
}

const setupComponentFactory = <T>(subject: constructor<T>, component: AnyComponent, selector: string): void => {
    componentFactoryMetadata.forwardFactoryTo(subject, component);

    Component(selector, {
        configureContainer: (container: Container) => {
            container.registerInstance(ComponentSubjectInjectionToken, container.resolve(subject));
            container.register(component, component);
        }
    })(component);
}

export const composableComponent =
    <T>(component: AnyComponent) =>
        (selector: string) =>
            (subject: constructor<T>): void => {
                setupContainer(subject);
                setupProps(subject, component);
                setupComponentFactory(subject, component, selector);
            }

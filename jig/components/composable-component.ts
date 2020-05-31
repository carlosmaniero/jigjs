import {AnyComponent, Component, componentFactoryMetadata, propsMetadata} from "./component";
import {constructor, Container, Inject, Injectable} from "../core/di";
import {createComponentPropsProxy, createProxyComponentFor} from "./proxy-component";

const ComponentSubjectInjectionToken = 'ComponentSubjectInjectionToken';

type PropertyDecorator = (target: unknown, targetKey: string, index?: number | undefined) => void;

export const Subject = (): PropertyDecorator =>
    (target: any, targetKey: string, index?: number | undefined): void => {
        Reflect.defineMetadata("design:type", targetKey, target, "jig:compose:subject");
        Inject(ComponentSubjectInjectionToken)(target, targetKey, index);
    };

const setupContainer = <T>(subject: constructor<T>): void => {
    Injectable()(subject);
}

const setupProps = <T>(subject: constructor<T>, component: AnyComponent): void => {
    const props = propsMetadata.getProps(subject.prototype);
    propsMetadata.setProps(component.prototype, props);

    const subjectKey: string = Reflect.getMetadata("design:type", component.prototype, "jig:compose:subject");
    createComponentPropsProxy(props, component, subjectKey);
}

const setupComponentFactory = <T>(subject: constructor<T>, component: AnyComponent, selector: string): void => {
    const props = propsMetadata.getProps(subject.prototype);
    const proxyComponent = createProxyComponentFor(component, props);
    componentFactoryMetadata.forwardFactoryTo(subject, proxyComponent);

    Component(selector, {
        configureContainer: (container: Container) => {
            container.register(proxyComponent, proxyComponent);
            container.registerInstance(ComponentSubjectInjectionToken, container.resolve(subject));
            container.register(component, component);
        }
    })(proxyComponent);
}

export const composableComponent =
    <T>(component: AnyComponent) => {
        Injectable()(component);

        return (selector: string) =>
            (subject: constructor<T>): void => {
                setupContainer(subject);
                setupProps(subject, component);
                setupComponentFactory(subject, component, selector);
            };
    }

import {Callback, Subject, Subscription} from "../events/subject";
import {constructor} from "../core/di";

const objectChangedSubjectSymbol: unique symbol = Symbol('jig-side-effect-object-change-subscriber');
const objectCreatedSubjectSymbol: unique symbol = Symbol('jig-side-effect-object-created-subscriber');
const propertiesToPropagateSymbol: unique symbol = Symbol('jig-side-effect-subscriber');

const propagationMetadata = {
    addPropagationProperty<T extends object>(subjectClass: T, property: PropertyKey): void {
        const properties = this.getPropagationProperties(subjectClass);

        Reflect.defineMetadata(propertiesToPropagateSymbol, [...properties, property], subjectClass)
    },
    getPropagationProperties<T extends object>(instance: T): (keyof T)[] {
        return Reflect.getMetadata(propertiesToPropagateSymbol, instance) || [];
    }
}

const constructorSubjectMetadata = {
    getConstructorSubjectFromClass<T extends object>(subjectClass: constructor<T>): Subject<T> {
        return Reflect.getMetadata(objectCreatedSubjectSymbol, subjectClass);
    },
    defineConstructorSubject<T extends object>(subjectClass: constructor<T>, subject: Subject<T>) {
        Reflect.defineMetadata(objectCreatedSubjectSymbol, subject, subjectClass);
    }
}

export const canSubscribeToSideEffects = <T extends object>(object: T): boolean => {
    return objectChangedSubjectSymbol in object;
}

export const subscribeToSideEffects = <T extends object>(object: T, callback: Callback<T>): Subscription => {
    if (!canSubscribeToSideEffects(object)) {
        throw new Error(`Cannot subscribe to changes. Is "${object.constructor.name}" decorated with @sideEffect()?`);
    }

    return object[objectChangedSubjectSymbol].subscribe(callback);
}

export const subscribeToConstruction = <T extends object>(object: constructor<T>, callback: Callback<T>): Subscription => {
    const constructorSubject = constructorSubjectMetadata.getConstructorSubjectFromClass(object);

    if (!constructorSubject) {
        throw new Error(`Cannot subscribe to construction. Is "${object.name}" decorated with @sideEffect()?`);
    }

    return constructorSubject
        .subscribe(callback);
}

class SideEffectPropagation <T extends object> {
    private subscriptions = {}

    constructor(
        private readonly instance: T,
        private readonly propertiesToPropagate: PropertyKey[],
        private readonly subject: Subject<T>
    ) {
        this.setup();
    }

    setup(): void {
        this.propertiesToPropagate.forEach((property) => {
            const instanceNode: object = this.instance[property];
            instanceNode && subscribeToSideEffects(instanceNode, () => {
                this.subject.publish(this.instance);
            });
        });
    }

    configureProperty(property: PropertyKey, value: any): void {
        if (this.isToPropagateProperty(property)) {
            return;
        }

        this.unsubscribe(property);

        value && this.subscribe(property, value);
    }

    private subscribe(property: PropertyKey, value: any): void {
        this.subscriptions[property] = subscribeToSideEffects(value, () => {
            this.subject.publish(this.instance);
        });
    }

    private unsubscribe(property: PropertyKey): void {
        if (this.subscriptions[property]) {
            this.subscriptions[property].unsubscribe();
        }
    }

    private isToPropagateProperty(property: PropertyKey): boolean {
        return !this.propertiesToPropagate.includes(property);
    }
}

export const sideEffect = <T extends object>() => (subjectClass: constructor<T>) => {
    const proxyConstructor = new Proxy(subjectClass, {
        construct(target: any, argArray: any, newTarget?: any): any {
            const instance = Reflect.construct(target, argArray, newTarget);

            const objectChangedSubject = new Subject<T>();
            instance[objectChangedSubjectSymbol] = objectChangedSubject;

            const properties = propagationMetadata.getPropagationProperties(instance);
            const sideEffectPropagation = new SideEffectPropagation(instance, properties, objectChangedSubject);

            const proxyInstance = new Proxy(instance, {
                set(target: any, property: PropertyKey, value: any, receiver: any): boolean {
                    sideEffectPropagation.configureProperty(property, value);
                    const didSet = Reflect.set(target, property, value, receiver);
                    objectChangedSubject.publish(target);
                    return didSet;
                }
            });

            constructorSubjectMetadata.getConstructorSubjectFromClass(subjectClass)
                .publish(proxyInstance);

            return proxyInstance;
        }
    });

    const subject: Subject<T> = new Subject();

    constructorSubjectMetadata.defineConstructorSubject(subjectClass, subject);
    constructorSubjectMetadata.defineConstructorSubject(proxyConstructor, subject);

    return proxyConstructor;
}

export const propagateSideEffects = <T extends object>() => (subjectClass: T, property: PropertyKey): void => {
    propagationMetadata.addPropagationProperty(subjectClass, property);
}

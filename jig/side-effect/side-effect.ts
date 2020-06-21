import {Callback, Subject, Subscription} from "../events/subject";

const subjectSymbol: unique symbol = Symbol('jig-side-effect-subscriber');
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

export const canSubscribeToSideEffects = <T extends object>(object: T): boolean => {
    return subjectSymbol in object;
}

export const subscribeToSideEffect = <T extends object>(object: T, callback: Callback<T>): Subscription => {
    if (!canSubscribeToSideEffects(object)) {
        throw new Error(`Cannot subscribe to changes. Is "${object.constructor.name}" decorated with @sideEffect()?`);
    }

    return object[subjectSymbol].subscribe(callback);
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
            instanceNode && subscribeToSideEffect(instanceNode, () => {
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
        this.subscriptions[property] = subscribeToSideEffect(value, () => {
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

export const sideEffect = <T extends object>() => (subjectClass: T) => {
    return new Proxy(subjectClass, {
        construct(target: any, argArray: any, newTarget?: any): any {
            const instance = Reflect.construct(target, argArray, newTarget);

            const subject = new Subject<T>();
            instance[subjectSymbol] = subject;

            const properties = propagationMetadata.getPropagationProperties(instance);
            const sideEffectPropagation = new SideEffectPropagation(instance, properties, subject);

            return new Proxy(instance, {
                set(target: any, property: PropertyKey, value: any, receiver: any): boolean {
                    sideEffectPropagation.configureProperty(property, value);
                    const didSet = Reflect.set(target, property, value, receiver);
                    subject.publish(target);
                    return didSet;
                }
            });
        }
    });
}

export const propagateSideEffects = <T extends object>() => (subjectClass: T, property: PropertyKey): void => {
    propagationMetadata.addPropagationProperty(subjectClass, property);
}

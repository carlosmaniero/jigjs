import {Callback, Subject, Subscription} from "../events/subject";

const subjectSymbol = Symbol('jig-side-effect-subscriber');

export const sideEffect = <T extends object>() => (subjectClass: T) => {
    return new Proxy(subjectClass, {
        construct(target: any, argArray: any, newTarget?: any): any {
            const instance = Reflect.construct(target, argArray, newTarget);

            const subject = new Subject<T>();
            instance[subjectSymbol] = subject;

            return new Proxy(instance, {
                set(target: any, p: PropertyKey, value: any, receiver: any): boolean {
                    const didSet = Reflect.set(target, p, value, receiver);
                    subject.publish(target);
                    return didSet;
                }
            });
        }
    });
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

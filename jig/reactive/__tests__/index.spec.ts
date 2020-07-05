import {observable, observe, observing, onConstruct, propagate, subscribersCount, waitUntil} from "../";
import {waitForPromises} from "../../testing/wait-for-promises";
import {describe} from "@jest/globals";


describe('side-effect', () => {
    describe('with classes', () => {
        it('listen to a side effect caused by a attribute change', () => {
            @observable()
            class SideEffectClass {
                @observing()
                public name = 'World';
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();

            observe(instance, callback);

            instance.name = 'Universe';

            expect(callback).toBeCalledWith(instance);
        });

        it('does not listen to a side effect caused for a non watched field', () => {
            @observable()
            class SideEffectClass {
                public name = 'World';
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();

            observe(instance, callback);

            instance.name = 'Universe';

            expect(callback).not.toBeCalled();
        });

        it('listen to a side effect caused by a method change', () => {
            @observable()
            class SideEffectClass {
                @observing()
                private name = 'World';

                toUniverse(): void {
                    this.name = 'Universe';
                }

                getName(): string {
                    return this.name;
                }
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();

            observe(instance, callback);
            instance.toUniverse();

            expect(callback).toBeCalledWith(instance);
            expect(instance.getName()).toBe('Universe');
        });

        it('throws an error when the class is not decorated', () => {
            class SideEffectClass {
                public name = 'World';
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();

            expect(() => {
                observe(instance, callback);
            }).toThrowError(new Error(`Cannot subscribe to changes. Is "SideEffectClass" decorated with @sideEffect()?`));
        });
    });

    describe('count subscribers', () => {
        it('counts subscribers', () => {
            @observable()
            class SideEffectClass {
                @observing()
                public name = 'World';
            }

            const instance = new SideEffectClass();

            observe(instance, jest.fn());
            const subs = observe(instance, jest.fn());

            expect(subscribersCount(instance)).toBe(2);

            subs.unsubscribe();

            expect(subscribersCount(instance)).toBe(1);
        });
    });
    
    describe('deep side effects', () => {
        it('propagates a change', () => {
            @observable()
            class SideEffectChildClass {
                @observing()
                public name = 'World';
            }

            @observable()
            class SideEffectChild2Class {
                @observing()
                public name = 'World';
            }

            @observable()
            class SideEffectClass {
                @propagate()
                public child = new SideEffectChildClass();

                @propagate()
                public child2 = new SideEffectChild2Class();
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();

            observe(instance, callback);
            instance.child.name = 'Universe';

            expect(callback).toBeCalledTimes(1);
            expect(callback).toBeCalledWith(instance);

            instance.child2.name = 'Universe';
            expect(callback).toBeCalledTimes(2);
        });

        it('propagates when the subject is added after class initialization', () => {
            @observable()
            class SideEffectChildClass {
                @observing()
                public name = 'World';
            }

            @observable()
            class SideEffectClass {
                @propagate()
                public child;
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();
            instance.child = new SideEffectChildClass();

            observe(instance, callback);
            instance.child.name = 'Universe';

            expect(callback).toBeCalledTimes(1);
            expect(callback).toBeCalledWith(instance);
        });

        it('unsubscribes when the instance changes', () => {
            @observable()
            class SideEffectChildClass {
                @observing()
                public name = 'World';
            }

            @observable()
            class SideEffectClass {
                @propagate()
                public child;
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();
            const initialChild = instance.child = new SideEffectChildClass();
            instance.child = new SideEffectChildClass();

            observe(instance, callback);
            initialChild.name = 'Universe';

            expect(callback).not.toBeCalled();
        });

        it('subscribes into child side effect only after subscription', () => {
            @observable()
            class SideEffectChildClass {
                @observing()
                public name = 'World';
            }

            @observable()
            class SideEffectClass {
                @propagate()
                public child = new SideEffectChildClass();
            }

            const instance = new SideEffectClass();
            expect(subscribersCount(instance.child)).toBe(0);
        });

        it('unsubscribes from child when unsubscribe from parent', () => {
            @observable()
            class SideEffectChildClass {
                @observing()
                public name = 'World';
            }

            @observable()
            class SideEffectClass {
                @propagate()
                public child = new SideEffectChildClass();
            }

            const instance = new SideEffectClass();

            observe(instance, jest.fn()).unsubscribe();

            expect(subscribersCount(instance.child)).toBe(0);
        });
    });

    describe('listening to constructor events', () => {
        it('listens when an object is created', () => {
            @observable()
            class SideEffectClass {
                @observing()
                public name = 'World';
            }

            const callback = jest.fn();
            onConstruct(SideEffectClass, callback);

            const instance = new SideEffectClass();
            expect(callback).toBeCalledWith(instance);
        });

        it('subscribes to the non proxy class', () => {
            class SideEffectClass {
                @observing()
                public name = 'World';
            }

            const ProxyClass = observable()(SideEffectClass);

            const callback = jest.fn();
            onConstruct(SideEffectClass, callback);

            const instance = new ProxyClass();
            expect(callback).toBeCalledWith(instance);
        });

        it('throws an exception when tries to subscribe to a non decorated class', () => {
            class SideEffectClass {
                @observing()
                public name = 'World';
            }

            const callback = jest.fn();

            expect(() => {
                onConstruct(SideEffectClass, callback);
            }).toThrowError(new Error(`Cannot subscribe to construction. Is "SideEffectClass" decorated with @sideEffect()?`));
        });
    });

    describe('dealing with asynchronicity in constructors', () => {
        it('handles side effects caused by async functions into constructor', async () => {
            @observable()
            class SideEffectClass {
                @observing()
                private name = 'World';

                constructor() {
                    setImmediate(() => {
                        this.updateNameTooUniverse();
                    })
                }

                private updateNameTooUniverse(): void {
                    this.name = 'Universe';
                }
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();
            observe(instance, callback);

            await waitForPromises();

            expect(callback).toBeCalledWith(instance);
        });
    });

    describe('waiting for a side effect', () => {
        it('waits for a side effect until the given condition is true', async () => {
            @observable()
            class SideEffectClass {
                @observing()
                public name = 'World';
            }

            const stub = jest.fn();

            const sideEffectClass = new SideEffectClass();

            waitUntil(sideEffectClass, (obj) => obj.name === 'Universe')
                .then(stub);

            await waitForPromises();
            expect(stub).not.toBeCalled();

            sideEffectClass.name = 'Solar System';

            await waitForPromises();
            expect(stub).not.toBeCalled();

            sideEffectClass.name = 'Universe';

            await waitForPromises();
            expect(stub).toBeCalled();
        });

        it('does not calls guard after it returns as resolved', async () => {
            @observable()
            class SideEffectClass {
                @observing()
                public name = 'World';
            }

            const stub = jest.fn(() => true);

            const sideEffectClass = new SideEffectClass();

            waitUntil(sideEffectClass, stub);

            sideEffectClass.name = 'Solar System';
            sideEffectClass.name = 'Universe';

            await waitForPromises();
            expect(stub).toBeCalledTimes(1);
        });
    });
});

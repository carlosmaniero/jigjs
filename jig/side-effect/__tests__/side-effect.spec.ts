import {propagateSideEffects, sideEffect, subscribeToConstruction, subscribeToSideEffects} from "../side-effect";

describe('side-effect', () => {
    describe('with classes', () => {
        it('listen to a side effect caused by a attribute change', () => {
            @sideEffect()
            class SideEffectClass {
                public name = 'World';
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();

            subscribeToSideEffects(instance, callback);

            instance.name = 'Universe';

            expect(callback).toBeCalledWith(instance);
        });

        it('listen to a side effect caused by a method change', () => {
            @sideEffect()
            class SideEffectClass {
                private name = 'World';

                toUniverse() {
                    this.name = 'Universe';
                }

                getName() {
                    return this.name;
                }
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();

            subscribeToSideEffects(instance, callback);
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
                subscribeToSideEffects(instance, callback);
            }).toThrowError(new Error(`Cannot subscribe to changes. Is "SideEffectClass" decorated with @sideEffect()?`));
        });
    });

    describe('deep side effects', () => {
        it('propagates a change', () => {
            @sideEffect()
            class SideEffectChildClass {
                public name = 'World';
            }

            @sideEffect()
            class SideEffectChild2Class {
                public name = 'World';
            }

            @sideEffect()
            class SideEffectClass {
                @propagateSideEffects()
                public child = new SideEffectChildClass();

                @propagateSideEffects()
                public child2 = new SideEffectChild2Class();
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();

            subscribeToSideEffects(instance, callback);
            instance.child.name = 'Universe';

            expect(callback).toBeCalledTimes(1);
            expect(callback).toBeCalledWith(instance);

            instance.child2.name = 'Universe';
            expect(callback).toBeCalledTimes(2);
        });

        it('propagates when the subject is added after class initialization', () => {
            @sideEffect()
            class SideEffectChildClass {
                public name = 'World';
            }

            @sideEffect()
            class SideEffectClass {
                @propagateSideEffects()
                public child;
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();
            instance.child = new SideEffectChildClass();

            subscribeToSideEffects(instance, callback);
            instance.child.name = 'Universe';

            expect(callback).toBeCalledTimes(1);
            expect(callback).toBeCalledWith(instance);
        });

        it('unsubscribes when the instance changes', () => {
            @sideEffect()
            class SideEffectChildClass {
                public name = 'World';
            }

            @sideEffect()
            class SideEffectClass {
                @propagateSideEffects()
                public child;
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();
            const initialChild = instance.child = new SideEffectChildClass();
            instance.child = new SideEffectChildClass();

            subscribeToSideEffects(instance, callback);
            initialChild.name = 'Universe';

            expect(callback).not.toBeCalled();
        });
    });

    describe('listening to constructor events', () => {
        it('listens when an object is created', () => {
            @sideEffect()
            class SideEffectClass {
                public name = 'World';
            }

            const callback = jest.fn();
            subscribeToConstruction(SideEffectClass, callback);

            const instance = new SideEffectClass();
            expect(callback).toBeCalledWith(instance);
        });

        it('subscribes to the non proxy class', () => {
            class SideEffectClass {
                public name = 'World';
            }

            const ProxyClass = sideEffect()(SideEffectClass);

            const callback = jest.fn();
            subscribeToConstruction(SideEffectClass, callback);

            const instance = new ProxyClass();
            expect(callback).toBeCalledWith(instance);
        });

        it('throws an exception when tries to subscribe to a non decorated class', () => {
            class SideEffectClass {
                public name = 'World';
            }

            const callback = jest.fn();

            expect(() => {
                subscribeToConstruction(SideEffectClass, callback);
            }).toThrowError(new Error(`Cannot subscribe to construction. Is "SideEffectClass" decorated with @sideEffect()?`));
        });
    });
});

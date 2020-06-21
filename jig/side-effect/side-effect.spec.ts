import {propagateSideEffects, sideEffect, subscribeToSideEffect} from "./side-effect";

describe('side-effect', () => {
    describe('with classes', () => {
        it('listen to a side effect caused by a attribute change', () => {
            @sideEffect()
            class SideEffectClass {
                public name = 'World';
            }

            const callback = jest.fn();
            const instance = new SideEffectClass();

            subscribeToSideEffect(instance, callback);

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

            subscribeToSideEffect(instance, callback);
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
                subscribeToSideEffect(instance, callback);
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

            subscribeToSideEffect(instance, callback);
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

            subscribeToSideEffect(instance, callback);
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

            subscribeToSideEffect(instance, callback);
            initialChild.name = 'Universe';

            expect(callback).not.toBeCalled();
        });
    });
});

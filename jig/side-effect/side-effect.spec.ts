import {sideEffect, subscribeToSideEffect} from "./side-effect";

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
});

import {globalContainer, Injectable} from "../di";

describe('Dependency Injection Container', () => {
    it('throws an exception given no resolver', () => {
        expect(() => globalContainer.resolve('asdas')).toThrowError();
    });

    it('throws an exception if an injectable class is not registered', () => {
        @Injectable()
        class AnyClass {

        }

        expect(() => globalContainer.resolve(AnyClass)).toThrowError();
    });

    it('registers a provider if absent', () => {
        globalContainer.registerAbsent("abc", {useValue: 123});
        globalContainer.registerAbsent("abc", {useValue: 234});
        expect(globalContainer.resolve("abc")).toBe(123);
        expect(globalContainer.resolveAll("abc")).toHaveLength(1);
    });

    it('registers singleton', () => {
        class MyClass {
            static count = 0;

            constructor() {
                MyClass.count++;
            }
        }

        globalContainer.registerSingleton(MyClass);
        globalContainer.resolve(MyClass);
        globalContainer.resolve(MyClass);
        globalContainer.resolve(MyClass);
        expect(MyClass.count).toBe(1);
    });
});

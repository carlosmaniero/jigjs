import {DIContainer} from "../di";
import {ContainerInjectionToken} from "../register";

describe('DI', () => {
    it('registers itself as a container', () => {
        expect(DIContainer.resolve(ContainerInjectionToken)).toBe(DIContainer);
    });
});

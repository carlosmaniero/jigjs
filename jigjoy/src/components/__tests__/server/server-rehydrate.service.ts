import {ServerRehydrateService} from "../../server/server-rehydrate-service";
import {DIContainer, registerContextualDependencies} from "../../../core/di";
import {RehydrateService} from "../../component";

describe('Rehydrate Service', () => {
    it('creates an incremental number as string as context', () => {
        const rehydrateService = new ServerRehydrateService();

        expect(rehydrateService.createContext()).toBe('0');
        expect(rehydrateService.createContext()).toBe('1');
    });

    it('returns undefined as context if it was not created', () => {
        const rehydrateService = new ServerRehydrateService();

        expect(rehydrateService.getContext("0")).toBeUndefined();
    });

    it('returns the defined context as context if it was created', () => {
        const rehydrateService = new ServerRehydrateService();

        const contextName = rehydrateService.createContext();

        rehydrateService.updateContext(contextName, {a: 1});

        expect(rehydrateService.getContext(contextName)).toEqual({a: 1});
    });

    it('is a singleton of RehydrateService', () => {
        const container = DIContainer.createChildContainer();
        registerContextualDependencies(container);
        const rehydrateService: RehydrateService = container.resolve(RehydrateService.InjectionToken);

        const contextName = rehydrateService.createContext();
        rehydrateService.updateContext(contextName, {a: 1});

        const rehydrateService2: RehydrateService = container.resolve(RehydrateService.InjectionToken);
        expect(rehydrateService2.getContext(contextName)).toEqual({a: 1});
    });
});

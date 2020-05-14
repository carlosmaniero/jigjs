import {globalContainer} from "../../../../core/di";
import {MetadataResolver} from "../../metadata-resolver";
import {MetadataWaitMiddleware} from "../../server/metadata-wait-middleware.service";
import {waitForPromises} from "../../../../testing/wait-for-promises";
import {RehydrateService} from "../../../../components/component";
import {ServerRehydrateService} from "../../../../components/server/server-rehydrate-service";

describe('MetadataAppInitializer', () => {
    it('waits for for metadata to be resolved', async () => {
        let resolver;

        const microservicesMetadata = {
            "http://localhost:3001/metadata": {
                eventsProvider: []
            }
        };
        globalContainer.registerInstance(MetadataResolver, {
                microservicesMetadata: microservicesMetadata,
                async wait(): Promise<void> {
                    return new Promise((resolve) => {
                        resolver = resolve;
                    }) as Promise<void>;
                }
            } as any);

        const rehydrateServer = new ServerRehydrateService();
        globalContainer.registerInstance(RehydrateService.InjectionToken, rehydrateServer);
        globalContainer.register(MetadataWaitMiddleware, MetadataWaitMiddleware);

        const metadataAppInitializer = globalContainer.resolve(MetadataWaitMiddleware);

        const mock = jest.fn();
        metadataAppInitializer.wait().then(mock);
        expect(mock).not.toBeCalled();
        resolver();
        await waitForPromises();
        expect(mock).toBeCalled();
        expect(rehydrateServer.getContext('jig-metadata')).toEqual(microservicesMetadata);
    });
});

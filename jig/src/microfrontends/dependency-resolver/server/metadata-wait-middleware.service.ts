import {MetadataResolver} from "../metadata-resolver";
import {Inject, Injectable} from "../../../core/di";
import {RequestWaitMiddleware} from "../../../server/middlewares";
import {RehydrateService} from "../../../components/component";

@Injectable()
export class MetadataWaitMiddleware implements RequestWaitMiddleware {
    constructor(
        private readonly metadataResolver: MetadataResolver,
        @Inject(RehydrateService.InjectionToken) private readonly rehydrateService: RehydrateService
    ) {
    }

    async wait(): Promise<void> {
        await this.metadataResolver.wait();
        this.rehydrateService.updateContext('jig-metadata', this.metadataResolver.microservicesMetadata);
    }
}

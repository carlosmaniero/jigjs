import {JigModule} from "../../../core/module";
import {MetadataWaitMiddleware} from "./metadata-wait-middleware.service";
import {MetadataResolver} from "../metadata-resolver";
import {RequestWaitMiddleware} from "../../../server/middlewares";

export const serverMetadataModule = (metadataResolver: MetadataResolver): JigModule => {
    return new JigModule({
        providers: [
            {provide: RequestWaitMiddleware.InjectionToken, useClass: MetadataWaitMiddleware}
        ]
    }).withContainer((container) => {
        container.registerInstance(MetadataResolver, metadataResolver);
    })
}

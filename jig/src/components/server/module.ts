import {JigModule} from "../../core/module";
import {BeforeFlushRequest, RequestWaitMiddleware} from "../../server/middlewares";
import {ServerFlushRehydrateState} from "./server-flush-rehydrate-state";
import {RehydrateService} from "../component";
import {ServerFragmentResolverWaitMiddleware} from "../../microfrontends/fragments/server/server-fragment-resolver";
import {ServerRehydrateService} from "./server-rehydrate-service";

export const serverComponentModule = () => new JigModule({
    providers: [
        {
            provide: BeforeFlushRequest.InjectionToken,
            useClass: ServerFlushRehydrateState
        },
        {
            provide: RehydrateService.InjectionToken,
            useClass: ServerRehydrateService
        },
        {
            provide: RequestWaitMiddleware.InjectionToken,
            useClass: ServerFragmentResolverWaitMiddleware
        }
    ]
})

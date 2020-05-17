import {JigModule} from "../../core/module";
import {RehydrateService} from "../component";
import {BrowserRehydrateService} from "./browser-rehydrate-service";

export const browserComponentModule = () => new JigModule({
    providers: [
        {
            provide: RehydrateService.InjectionToken,
            useClass: BrowserRehydrateService
        },
    ]
})

import {JigJoyModule} from "../../core/module";
import {RehydrateService} from "../component";
import {BrowserRehydrateService} from "./browser-rehydrate-service";

export const browserComponentModule = () => new JigJoyModule({
    providers: [
        {
            provide: RehydrateService.InjectionToken,
            useClass: BrowserRehydrateService
        },
    ]
})

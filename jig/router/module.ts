import {JigModule} from "../core/module";
import {RouterLink} from "./router-link";
import {Router, RouterHooks, Routes} from "./router";

export const routerModule = (routes: Routes) => new JigModule({
    components: [
        RouterLink
    ],
    providers: [
        {provide: Routes, useValue: routes},
        {provide: RouterHooks, useClass: RouterHooks},
        {provide: Router, useClass: Router}
    ]
})

import {JigModule} from "../core/module";
import {Router, RouterHooks, Routes} from "./router";

export const routerModule = (routes: Routes) => new JigModule({
    providers: [
        {provide: Routes, useValue: routes},
        {provide: RouterHooks, useClass: RouterHooks},
        {provide: Router, useClass: Router}
    ]
})

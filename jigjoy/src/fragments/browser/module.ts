import {JigJoyModule} from "../../core/module";
import {FragmentComponentFactory} from "../fragment-component";
import {FragmentContentRender, FragmentResolver} from "../fragments";
import {BrowserContentRender} from "./browser-content-render";
import {BrowserFragmentResolver} from "./browser-fragment-resolver";

export const browserFragmentModule = () => new JigJoyModule({
    providers: [
        {provide: FragmentComponentFactory, useClass: FragmentComponentFactory},
        {provide: FragmentContentRender.InjectionToken, useClass: BrowserContentRender},
        {provide: FragmentResolver.InjectionToken, useClass: BrowserFragmentResolver},
    ]
})

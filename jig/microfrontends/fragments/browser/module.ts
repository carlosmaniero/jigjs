import {JigModule} from "../../../core/module";
import {FragmentContentRender, FragmentResolver} from "../fragments";
import {BrowserContentRender} from "./browser-content-render";
import {BrowserFragmentResolver} from "./browser-fragment-resolver";
import {FragmentFetch} from "../fragment-fetch";

export const browserFragmentModule = () => new JigModule({
    providers: [
        {provide: FragmentFetch, useClass: FragmentFetch},
        {provide: FragmentContentRender.InjectionToken, useClass: BrowserContentRender},
        {provide: FragmentResolver.InjectionToken, useClass: BrowserFragmentResolver},
    ]
})

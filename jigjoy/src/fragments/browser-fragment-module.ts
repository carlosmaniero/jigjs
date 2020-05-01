import {JigJoyModule} from "../core/module";
import {FragmentContentRender, FragmentResolver} from "./fragments";
import {BrowserFragmentResolver} from "./browser-fragment-resolver";
import {BrowserContentRender} from "./browser-content-render";

export const browserFragmentModule = new JigJoyModule({
    providers: [
        {provide: FragmentResolver.InjectionToken, useClass: BrowserFragmentResolver},
        {provide: FragmentContentRender.InjectionToken, useClass: BrowserContentRender}
    ]
})

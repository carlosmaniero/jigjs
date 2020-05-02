import {JigJoyModule} from "../core/module";
import {FragmentContentRender, FragmentResolver} from "./fragments";
import {ServerFragmentResolver} from "./server-fragment-resolver";
import {ServerContentRender} from "./server-content-render";

export const serverFragmentModule = new JigJoyModule({
    providers: [
        {provide: FragmentResolver.InjectionToken, useClass: ServerFragmentResolver},
        {provide: FragmentContentRender.InjectionToken, useClass: ServerContentRender}
    ]
})

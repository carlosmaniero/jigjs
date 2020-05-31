import {FragmentContentRender, FragmentResolver} from "../fragments";
import {ServerContentRender} from "./server-content-render";
import {ServerFragmentResolver} from "./server-fragment-resolver";
import {JigModule} from "../../../core/module";
import {FragmentFetch} from "../fragment-fetch";

export const serverFragmentModule = () => new JigModule({
    providers: [
        {provide: FragmentContentRender.InjectionToken, useClass: ServerContentRender},
        {provide: FragmentResolver.InjectionToken, useClass: ServerFragmentResolver},
        {provide: FragmentFetch, useClass: FragmentFetch},
    ]
})

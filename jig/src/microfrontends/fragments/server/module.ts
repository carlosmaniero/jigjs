import {FragmentComponentFactory} from "../fragment-component";
import {FragmentContentRender, FragmentResolver} from "../fragments";
import {ServerContentRender} from "./server-content-render";
import {ServerFragmentResolver} from "./server-fragment-resolver";
import {JigModule} from "../../../core/module";

export const serverFragmentModule = () => new JigModule({
    providers: [
        {provide: FragmentComponentFactory, useClass: FragmentComponentFactory},
        {provide: FragmentContentRender.InjectionToken, useClass: ServerContentRender},
        {provide: FragmentResolver.InjectionToken, useClass: ServerFragmentResolver},
    ]
})

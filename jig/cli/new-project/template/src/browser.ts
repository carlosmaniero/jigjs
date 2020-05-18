import 'jigjs/core/register';
import {JigBrowser} from "jigjs/browser/browser";
import {browserFragmentModule} from "jigjs/microfrontends/fragments/browser/module";
import {browserComponentModule} from "jigjs/components/browser/module";


export default new JigBrowser([
    browserComponentModule(),
    browserFragmentModule()
]);

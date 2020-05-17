import '../../../jig/src/core/register';
import {JigBrowser} from "../../../jig/src/browser/browser";
import {browserFragmentModule} from "../../../jig/src/microfrontends/fragments/browser/module";
import {browserComponentModule} from "../../../jig/src/components/browser/module";


export default new JigBrowser([
    browserComponentModule(),
    browserFragmentModule()
]);

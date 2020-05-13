import '../../../jig/src/core/register';
import {app} from "./app";
import {JigBrowser} from "../../../jig/src/browser/browser";
import {browserComponentModule} from "../../../jig/src/components/browser/module";
import {browserFragmentModule} from "../../../jig/src/fragments/browser/module";


new JigBrowser(
    app
        .withModule(browserComponentModule())
        .withModule(browserFragmentModule())
).init();

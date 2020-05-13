import '../../../jigjoy/src/core/register';
import {app} from "./app";
import {JigBrowser} from "../../../jigjoy/src/browser/browser";
import {browserComponentModule} from "../../../jigjoy/src/components/browser/module";
import {browserFragmentModule} from "../../../jigjoy/src/fragments/browser/module";


new JigBrowser(
    app
        .withModule(browserComponentModule())
        .withModule(browserFragmentModule())
).init();

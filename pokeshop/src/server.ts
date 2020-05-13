import '../../jig/src/core/register';
import {JigServer} from "../../jig/src/server/server";
import path from "path";
import "../../jig/src/fragments/server/server-fragment-module";
import "../../jig/src/components/server/server-flush-rehydrate-state";
import {serverComponentModule} from "../../jig/src/components/server/module";
import {app} from "./components/app";
import {serverFragmentModule} from "../../jig/src/fragments/server/module";

new JigServer({
    routes: [{
        route: '/',
        templatePath: path.join(__dirname, 'templates', 'index.html'),
        app: app
            .withModule(serverComponentModule())
            .withModule(serverFragmentModule())
    }],
    assetsPath: path.join(__dirname, '../', 'dist'),
    port: 4200
}).start()

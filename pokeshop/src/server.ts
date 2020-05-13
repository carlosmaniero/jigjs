import '../../jigjoy/src/core/register';
import {JigJoyServer} from "../../jigjoy/src/server/server";
import path from "path";
import "../../jigjoy/src/fragments/server/server-fragment-module";
import "../../jigjoy/src/components/server/server-flush-rehydrate-state";
import {serverComponentModule} from "../../jigjoy/src/components/server/module";
import {app} from "./components/app";
import {serverFragmentModule} from "../../jigjoy/src/fragments/server/module";

new JigJoyServer({
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

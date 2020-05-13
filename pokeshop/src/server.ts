import '../../jig/src/core/register';
import {JigServer} from "../../jig/src/server/server";
import path from "path";
import {serverComponentModule} from "../../jig/src/components/server/module";
import {app} from "./components/app";
import {serverFragmentModule} from "../../jig/src/microfrontends/fragments/server/module";

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

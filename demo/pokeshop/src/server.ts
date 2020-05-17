import '../../../jig/src/core/register';
import {JigServer} from "../../../jig/src/server/server";
import path from "path";
import {serverComponentModule} from "../../../jig/src/components/server/module";
import homeApp from "./apps/home";
import {serverFragmentModule} from "../../../jig/src/microfrontends/fragments/server/module";

const serverHomeApp = homeApp
    .withModule(serverComponentModule())
    .withModule(serverFragmentModule());

new JigServer({
    routes: [
        {
            route: '/',
            templatePath: path.join(__dirname, 'templates', 'index.html'),
            app: serverHomeApp
        },
        {
            route: '/page/:page',
            templatePath: path.join(__dirname, 'templates', 'index.html'),
            app: serverHomeApp
        }],
    assetsPath: path.join(__dirname, '../', 'dist'),
    port: 4200
}).start()

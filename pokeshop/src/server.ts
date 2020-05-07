import '../../jigjoy/src/core/register';
import {JigJoyServer} from "../../jigjoy/src/server/server";
import path from "path";
import "../../jigjoy/src/fragments/server/server-fragment-module";
import  "../../jigjoy/src/components/server/server-flush-rehydrate-state";
import {app} from "./components/app";

new JigJoyServer({
    routes: [{
        route: '/',
        templatePath: path.join(__dirname, 'templates', 'index.html'),
        app
    }],
    assetsPath: path.join(__dirname, '../', 'dist'),
    port: 4200
}).start()

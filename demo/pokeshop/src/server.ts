import 'jigjs/core/register';
import {JigServer} from "jigjs/server/server";
import path from "path";
import {serverComponentModule} from "jigjs/components/server/module";
import homeApp from "./apps/home";
import {serverFragmentModule} from "jigjs/microfrontends/fragments/server/module";
import {Server} from "jigjs/pure-server/server";
import {AppFactory, ServerSideRendering} from "jigjs/pure-server/ssr";
import {App} from "jigjs/pure-app/app";
import {RouterModule} from "jigjs/pure-router/module";
import {Routes} from "jigjs/pure-router/routes";
import {html, pureComponent} from "jigjs/pure-components/pure-component";

const serverHomeApp = homeApp
    .withModule(serverComponentModule())
    .withModule(serverFragmentModule());

new JigServer({
    routes: [
        {
            route: '*',
            templatePath: path.join(__dirname, 'templates', 'index.html'),
            app: serverHomeApp
        }],
    assetsPath: path.join(__dirname, '../', 'dist'),
    port: 4200
}).start()


const appFactory: AppFactory = (window) => {
    @pureComponent()
    class Component {
        render() {
            return html`Vai marquinho!`;
        }
    }

    const routes = new Routes([{
        path: '/',
        name: 'home',
        handler(params, render) {
            render(new Component())
        }
    }]);

    return new App(new RouterModule(window, routes))
}

new Server(new ServerSideRendering(appFactory, `
<html>
    <head>
        <title>Hello!</title>
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>`, '#root')).start(4201);

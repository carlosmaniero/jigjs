import 'jigjs/core/register';
import {Server} from "jigjs/pure-server/server";
import {ServerSideRendering} from "jigjs/pure-server/ssr";
import {appFactory} from "./app";

new Server(new ServerSideRendering(appFactory, `
<html>
    <head>
        <title>Hello!</title>
        <script src="main.app.js"></script>
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>`, '#root')).start(4201);

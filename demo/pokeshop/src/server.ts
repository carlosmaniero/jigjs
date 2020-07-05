import {appFactory} from "./app";
import {Server} from "jigjs/framework/server/server";
import {ServerSideRendering} from "jigjs/framework/server/ssr";

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

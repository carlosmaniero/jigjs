import '../../jig/src/core/register';
import {JigServer} from "../../jig/src/server/server";
import path from "path";
import {serverComponentModule} from "../../jig/src/components/server/module";
import homeApp from "./apps/home";
import {serverFragmentModule} from "../../jig/src/microfrontends/fragments/server/module";
import {serverMetadataModule} from "../../jig/src/microfrontends/dependency-resolver/server/module";
import {MetadataResolver} from "../../jig/src/microfrontends/dependency-resolver/metadata-resolver";

new JigServer({
    routes: [{
        route: '/',
        templatePath: path.join(__dirname, 'templates', 'index.html'),
        app: homeApp
            .withModule(serverComponentModule())
            .withModule(serverFragmentModule())
            .withModule(serverMetadataModule(MetadataResolver.of("http://localhost:3001/metadata")))
    }],
    assetsPath: path.join(__dirname, '../', 'dist'),
    port: 4200
}).start()

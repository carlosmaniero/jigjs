import express, {Express} from 'express';
import {JigJoyApp} from "../core/app";
import {globalContainer} from "../core/di";
import {ServerTemplateController} from "./controller";
import {ModuleProvider} from "../core/module";

export interface TemplateRoute {
    route: string,
    templatePath: string,
    app: JigJoyApp,
    encode?: string
}

export interface JigJoyServerOptions {
    assetsPath: string,
    port: number,
    customProviders?: ModuleProvider<any>[],
    routes: TemplateRoute[]
}

export class JigJoyServer {
    readonly app: Express;
    private readonly use: any;

    constructor(private readonly options: JigJoyServerOptions) {
        this.app = express();
        this.use = this.app.use;

        options.customProviders?.forEach((provider) => {
            globalContainer.register(provider.provide, provider as any);
        });

        globalContainer.registerAbsent(ServerTemplateController, ServerTemplateController);

        this.setupStaticDirectory();
        this.setupStaticRoutes();
    }

    public start() {
        const {port} = this.options;

        this.app.listen(port, function () {
            console.log(`JigJoyServer is running on http://localhost:${port}!`);
        });
    }

    private setupStaticDirectory() {
        this.app.use(express.static(this.options.assetsPath));
    }

    private setupStaticRoutes() {
        const serverTemplateController = globalContainer.resolve(ServerTemplateController);

        this.options.routes.forEach((route) => {
            this.app.get(route.route, async (req, res) => serverTemplateController.resolve({
                ...route, res, req
            }));
        });
    }
}

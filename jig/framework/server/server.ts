import {ServerSideRendering} from "./ssr";
import express, {Express} from "express";
import chalk from "chalk";
import * as http from "http";

export class Server {
    public readonly app: Express;
    private listener: http.Server;

    constructor(private readonly ssr: ServerSideRendering) {
        this.app = express();
    }

    configure() {
        this.app.use(express.static(process.cwd() + '/dist'));

        this.app.get('*', async (req, res) => {
            const responseBody = await this.ssr.renderRouteAsString(req.url);
            res.statusCode = responseBody.status;
            res.send(responseBody.responseText);
        });
    }

    public start(port: number): void {
        this.configure();

        this.listener = this.app.listen(port, function () {
            console.log('.----------------------------------------.')
            console.log(`| 🧩 ${chalk.bold.hex('f67280')('Jig.js')} - ${chalk.bold('A micro-frontend framework')} |`)
            console.log('|----------------------------------------|')
            console.log(`|    Server is running at port: ${chalk.bold.green(port)}     |`);
            console.log('\'----------------------------------------\'')
        });
    }

    public stop() {
        this.listener.close();
    }
}

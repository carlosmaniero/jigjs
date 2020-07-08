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

    configure(): void {
        this.app.use(express.static(process.cwd() + '/dist'));

        this.app.get('*', async (req, res) => {
            const ssrResponse = await this.ssr.renderRouteAsString(req.url);
            res.statusCode = ssrResponse.statusCode;

            for (const key in ssrResponse.headers) {
                if (ssrResponse.headers.hasOwnProperty(key)) {
                    res.setHeader(key, ssrResponse.headers[key]);
                }
            }

            res.send(ssrResponse.responseText);
        });
    }

    public start(port: number): void {
        this.configure();

        this.listener = this.app.listen(port, function () {
            console.log(`🧩 ${chalk.bold.hex('f67280')('Jig.js')} - Server
🔍 Server is running at port: ${chalk.bold.green(port)}
🔗 http://localhost:${port}/
`);
        });
    }

    public stop() {
        this.listener.close();
    }
}

import 'jigjs/core/register';
import express from 'express';
import {JigServer} from "jigjs/server/server";
import path from "path";
import {serverComponentModule} from "jigjs/components/server/module";
import homeApp from "./apps/home";
import {serverFragmentModule} from "jigjs/microfrontends/fragments/server/module";

const serverHomeApp = homeApp
    .withModule(serverComponentModule())
    .withModule(serverFragmentModule());

const jigServer = new JigServer({
    routes: [
        {
            route: '/',
            templatePath: path.join(__dirname, 'templates', 'index.html'),
            app: serverHomeApp
        }],
    assetsPath: path.join(__dirname, '../', 'dist'),
    port: 4200
});
jigServer.app.use(express.static('assets'));
jigServer.start()

import {appFactory} from "./app";
import express from 'express';
import {ServerSideRendering} from 'jigjs/framework/server/ssr';
import {Server} from "jigjs/framework/server/server";


const template = `<html lang="en">
    <head>
        <title>Jig!</title>
        <link href="https://fonts.googleapis.com/css2?family=Mandali&display=swap" rel="stylesheet">
        <style>
            body {
                padding: 0;
                margin: 0;
            }
        </style>
    </head>
    <body>
        <div id="root"></div>
        <!-- jigjs main build file -->
        <script src="/main.app.js"></script>
    </body>
</html>`;

let server = new Server(new ServerSideRendering(appFactory, template, '#root'));

server.app.use(express.static(process.cwd() + '/assets'));

server.start(3333);

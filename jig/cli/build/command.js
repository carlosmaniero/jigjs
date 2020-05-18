#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const toDeletePath = require('path');
const webpack = require('webpack');
const config = require('./webpack.config');
const chalk = require('chalk');

console.log(chalk.bold.green('Starting Jig.js Build!'));
console.log(`📁 ${chalk.bold('Working directory')}: ${process.cwd()}`);

const finishWithError = (e, humanMessage) => {
    humanMessage && console.error(humanMessage)
    e && console.error(`${chalk.bold.red('Error detail: ')} ${e.message}`);
    cleanTempFiles();
    process.exit(1);
}

const createAppBuildFile = (appFile) => new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/entry-template.js`, 'utf-8', (err, template) => {
        const buildFile = template.replace(/!!app-name!!/g, appFile);

        const appJsName = appFile.replace('.ts', '.js');
        const buildPath = `./.jig/${appJsName}`;

        fs.writeFile(buildPath, buildFile, (err) => {
            if (!err) {
                console.log(`${chalk.green('✔️')} created browser setup for ${chalk.bold(appFile)}`);
                return resolve({
                    buildFile: buildPath,
                    appName: appJsName
                });
            }

            return reject(err)
        });
    });
})

const appsPath = toDeletePath.join(process.cwd(), 'src', 'apps');

const getAppsList = () => {
    try {
        return fs.readdirSync(appsPath);
    } catch (e) {
        finishWithError(e, `It was not possible to fetch apps into ${chalk.red(appsPath)}`);
    }
}

let apps = getAppsList();
const jigTempPath = toDeletePath.join(process.cwd(), '.jig');

if (!fs.existsSync(jigTempPath)) {
    fs.mkdirSync(jigTempPath);
}

const removeFolder = (toDeletePath) => {
    if (fs.existsSync(toDeletePath)) {
        fs.readdirSync(toDeletePath).forEach((file, index) => {
            const curPath = path.join(toDeletePath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                removeFolder(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(toDeletePath);
    }
}

const cleanTempFiles = () => {
    console.log(chalk.bold('🧹 cleaning temporary files'));
    removeFolder(jigTempPath);
}

Promise.all(apps.map((app) => createAppBuildFile(app)))
    .then((files) => {
        const entries = files.reduce(
            (acc, file) => ({...acc, [file.appName.replace('.js', '')]: file.buildFile}),
            {}
        );

        console.log(`📁 ${chalk.bold('Bundle Directory')} ${config.output.path}`)
        webpack({...config, entry: entries}, (err, stats) => {
            if (err) {
                finishWithError(err, 'Unable to compile');
            }
            if (stats.hasErrors()) {
                const statsJson = stats.toJson('minimal');
                console.error(chalk.red.bold('Compilation Error'));
                statsJson.errors.forEach(error => console.error(error));
                finishWithError();
                return;
            }
            console.log(chalk.bold('📦 bundle created'));
            cleanTempFiles();
        });
    });

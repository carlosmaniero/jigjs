#!/usr/bin/env node
require('ts-node').register();
const path = require('path');
const webpack = require('webpack');
const config = require('./webpack.config');
const chalk = require('chalk');

const browserFile = path.join(process.cwd(), 'src', 'browser.ts');

console.log(chalk.bold.green('Starting Jig.js Build!'));
console.log(`📁 ${chalk.bold('Working directory')}: ${process.cwd()}`);
console.log(`👷 ${chalk.bold('Building')}: ${browserFile}‍`);

const finishWithError = (e, humanMessage) => {
    humanMessage && console.error(humanMessage)
    e && console.error(`${chalk.bold.red('Error detail: ')} ${e.message}`);
    process.exit(1);
}

webpack({...config, entry: browserFile}, (err, stats) => {
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
});
//
// const compiledBundles = {};
//
// const createAppBuildFile = (appFile) => new Promise((resolve, reject) => {
//     fs.readFile(`${__dirname}/entry-template.js`, 'utf-8', (err, template) => {
//         const appTsFile = path.join(process.cwd(), 'src', 'apps', `${appFile}`)
//         const app = require(appTsFile)
//         const appBundleName = app.default.options.bundleName;
//
//         if (compiledBundles[appBundleName]) {
//             finishWithError(null, `🛑 Could not compile ${chalk.bold.red(appFile)}. The bundle name ${chalk.bold(appBundleName)} was already taken by ${chalk.bold(compiledBundles[appBundleName])}`);
//             return;
//         }
//
//         compiledBundles[appBundleName] = appFile;
//
//         const buildFile = template
//             .replace(/!!app-name!!/g, appFile);
//
//         const appJsName = appBundleName + '.js';
//         const buildPath = `./.jig/${appJsName}`;
//
//         fs.writeFile(buildPath, buildFile, (err) => {
//             if (!err) {
//                 console.log(`${chalk.bold.green('✅️')} created browser setup from ${chalk.bold(appFile)} to ${chalk.bold(appJsName)}`);
//                 return resolve({
//                     buildFile: buildPath,
//                     appName: appJsName
//                 });
//             }
//
//             return reject(err)
//         });
//     });
// })
//
// const appsPath = toDeletePath.join(process.cwd(), 'src', 'apps');
//
// const getAppsList = () => {
//     try {
//         return fs.readdirSync(appsPath);
//     } catch (e) {
//         finishWithError(e, `It was not possible to fetch apps into ${chalk.red(appsPath)}`);
//     }
// }
//
// let apps = getAppsList();
// const jigTempPath = toDeletePath.join(process.cwd(), '.jig');
//
// if (!fs.existsSync(jigTempPath)) {
//     fs.mkdirSync(jigTempPath);
// }
//
// const removeFolder = (toDeletePath) => {
//     if (fs.existsSync(toDeletePath)) {
//         fs.readdirSync(toDeletePath).forEach((file, index) => {
//             const curPath = path.join(toDeletePath, file);
//             if (fs.lstatSync(curPath).isDirectory()) {
//                 removeFolder(curPath);
//             } else {
//                 fs.unlinkSync(curPath);
//             }
//         });
//         fs.rmdirSync(toDeletePath);
//     }
// }
//
// const cleanTempFiles = () => {
//     console.log(chalk.bold('🧹 cleaning temporary files'));
//     removeFolder(jigTempPath);
// }
//
// Promise.all(apps.map((app) => createAppBuildFile(app)))
//     .then((files) => {
//         const entries = files.reduce(
//             (acc, file) => ({...acc, [file.appName.replace('.js', '')]: file.buildFile}),
//             {}
//         );
//
//         console.log(`📁 ${chalk.bold('Bundle Directory')} ${config.output.path}`)
//         webpack({...config, entry: entries}, (err, stats) => {
//             if (err) {
//                 finishWithError(err, 'Unable to compile');
//             }
//             if (stats.hasErrors()) {
//                 const statsJson = stats.toJson('minimal');
//                 console.error(chalk.red.bold('Compilation Error'));
//                 statsJson.errors.forEach(error => console.error(error));
//                 finishWithError();
//                 return;
//             }
//             console.log(chalk.bold('📦 bundle created'));
//             cleanTempFiles();
//         });
//     });

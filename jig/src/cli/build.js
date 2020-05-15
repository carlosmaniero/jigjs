const fs = require('fs');
const webpack = require('webpack');
const config = require('./webpack.config');

console.log('Starting Jig.Js Build!')
console.log(`Working directory: ${process.cwd()}`);

const createAppBuildFile = (appFile) => new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/entry-template.js`, 'utf-8', (err, template) => {
        const buildFile = template.replace(/!!app-name!!/g, appFile);

        const appJsName = appFile.replace('.ts', '.js');
        const buildPath = `./.jig/${appJsName}`;
        fs.writeFile(buildPath, buildFile, (err) => {
            if (!err) {
                console.log(`created build file for app ${appFile}`)
                return resolve({
                    buildFile: buildPath,
                    appName: appJsName
                });
            }

            return reject(err)
        });
    });
})

const apps = fs.readdirSync('./src/apps/');

if (!fs.existsSync('./.jig')) {
    fs.mkdirSync('./.jig');
}

Promise.all(apps.map((app) => createAppBuildFile(app)))
    .then((files) => {
        const entries = files.reduce(
            (acc, file) => ({...acc, [file.appName.replace('.js', '')]: file.buildFile}),
            {}
        );

        webpack({...config, entry: entries}, (err, stats) => {
            if (err || stats.hasErrors()) {
                console.error(err);
                console.error(stats);
            }
        });
    });

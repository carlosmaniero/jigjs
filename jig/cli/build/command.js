#!/usr/bin/env node
require('ts-node').register();
const path = require('path');
const webpack = require('webpack');
const config = require('./webpack.config');
const chalk = require('chalk');

const browserFile = path.join(process.cwd(), 'src', 'browser.ts');

console.log(`🧩 ${chalk.bold.hex('f67280')('Jig.js')} ${chalk.bold.bold('- Starting Build!')}
📁 ${chalk.bold('Working directory')}: ${process.cwd()}
👷 ${chalk.bold('Building')}: ${browserFile}
`);

const finishWithError = (e, humanMessage) => {
    humanMessage && console.error(humanMessage)
    e && console.error(`${chalk.bold.red('Error detail: ')} ${e.message}`);
    process.exit(1);
}

const isWatching = process.env.BUILD_WATCH === 'true';
webpack({
    ...config,
    entry: browserFile,
    watch: isWatching
}, (err, stats) => {
    if (err) {
        finishWithError(err, '🚫 Unable to compile');
    }
    if (stats.hasErrors()) {
        const statsJson = stats.toJson('minimal');
        console.error(chalk.red.bold('🚫 Compilation Error'));
        statsJson.errors.forEach(error => console.error(error));
        !isWatching && finishWithError();
        return;
    }
    console.log(chalk.bold('📦 Bundle created'));
});

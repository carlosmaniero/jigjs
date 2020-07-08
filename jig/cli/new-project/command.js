#!/usr/bin/env node
const prompts = require('prompts');
const fs = require('fs');
const path = require('path');
const jigjsPackage = require('../../package.json');
const ncp = require('ncp').ncp;
const chalk = require('chalk');

function writePackageJson(appName, projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = fs.readFileSync(packageJsonPath, 'utf-8')
        .replace('{{app-name}}', appName)
        .replace('{{jigjs-version}}', jigjsPackage.version);

    fs.writeFileSync(packageJsonPath, packageJson);
}

const validateProjectName = (text) => {
    if (text.length < 3) {
        return 'It must have at least 3 characters.';
    }

    if (!/^[a-z0-9_-]+$/.test(text)) {
        return 'It must have only letters, numbers, dash (-) and underscore (_).';
    }

    if (!/^[a-z]([a-z0-9_-]+)[a-z0-9]$/.test(text)) {
        return 'It must start with a letter and ends with a letter or number.';
    }

    if (fs.existsSync(path.join(process.cwd(), text))) {
        return `${text} folder already exists.`
    }

    return true;
}

(async () => {
    console.log(`🧩 ${chalk.bold.hex('f67280')('Jig.js')} ${chalk.bold.bold('- New project')}`);
    const response = await prompts({
        type: 'text',
        name: 'projectName',
        message: 'Project name:',
        validate: validateProjectName
    });

    const projectName = response.projectName;

    if (!projectName) {
        return;
    }

    const projectPath = path.join(process.cwd(), projectName);

    console.log(chalk.bold('📁 Creating project at ') + projectPath);

    ncp(path.join(__dirname, 'template'), projectPath, function (err) {
        if (err) {
            return console.error(err);
        }

        writePackageJson(projectName, projectPath);

        console.log(`${chalk.bold('✅')} ${chalk.bold(projectName)} created with success!`);
        console.log(chalk.bold('🚀 Run the commands bellow:'));
        console.log(`${chalk.bold('$')} cd ${projectName}`);
        console.log(`${chalk.bold('$')} npm install`);
        console.log(`${chalk.bold('$')} npm run dev`);
        console.log(chalk.bold('🍻 Happy code!'));
    });
})();

#!/usr/bin/env node

const util = require('util');
const exec = util.promisify(require('child_process').exec);

(async function () {
    try {
        const package = require('../package.json');

        console.log('git config --global user.name "Travis CI"');
        const exec1 = await exec('git config --global user.name "Travis CI"', { shell: true});

        console.log(`Running: git tag ${package.version}`);
        const exec2 = await exec(`git tag ${package.version}`, { shell: true});

        console.log(`Running: git push --tags`);
        const exec3 = await exec(`git push "https://${process.env.ENV_GITHUB_USERNAME}:${process.env.ENV_GITHUB_PASSWORD}@github.com/dannyYassine/operationkit.git/" --tags`, { shell: true});

        console.log('SUCCESS');
        process.exit(0);
    } catch (e) {

        console.log('ERROR');
        console.log(e);
        process.exit(1);
    }
})()




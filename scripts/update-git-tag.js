#!/usr/bin/env node

const util = require('util');
const exec = util.promisify(require('child_process').exec);

(async function () {
    try {
        const package = require('../package.json');

        // await exec('git config --global user.email "${ENV_EMAIL}"', { shell: true});
        // await exec('git config --global user.name "Travis CI"', { shell: true});
        console.log('1');
        // const exec1 = await exec(`git tag ${package.version}`, { shell: true});
        console.log('2');
        const exec2 = await exec(`git add .`, { shell: true});
        console.log('3');
        const exec3 = await exec(`git commit -m "Updating version ${package.version}"`, { shell: true});
        console.log('4');
        const exec4 = await exec(`git push && git push --tags`, { shell: true});
        console.log('success');
        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
})()




const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');

require('dotenv').config()
//let url = "http://" + process.env.JENKINS_USER + ":" + process.env.JENKINS_PASS + "@" + process.env.JENKINS_URL
//const jenkins = require('jenkins')({ baseUrl : url, crumbIssuer: true, promisify: true });

const sshSync = require('../lib/ssh');

exports.command = 'deploy <app>';
exports.desc = 'Deploy iTrust';
exports.builder = yargs => {
    yargs.options({
        file: {
            describe: 'Provide the path to the main itrust_deploy.yml',
            type: 'string',
            default: 'pipeline/itrust_deploy.yml'
        },        
        app: {
            describe: 'Provide application name',
            default: '',
            type: 'string'
        },
        inventory: {
            alias: 'i',
            describe: 'Provide the path to the main inventory.ini',
            default: 'pipeline/inventory.ini',
            type: 'string'
        }
    });
};

exports.handler = async argv => {
    const { app, inventory } = argv;
    (async () => {
        await run(app, inventory);
    })();
};

async function run(app, inventory) {

    console.log(inventory);
    console.log(app);

    // let filePath = '/bakerx/'+ file;
    // let inventoryPath = '/bakerx/' +inventory;

    // console.log(chalk.blueBright('Running ansible script...'));
    // result = sshSync(`/bakerx/pipeline/run-ansible.sh ${filePath} ${inventoryPath} ${vaultPath} ${ghUser} ${ghPass}`, 'vagrant@192.168.33.11');
    // if( result.error ) { process.exit( result.status ); }


}

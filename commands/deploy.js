const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');

require('dotenv').config()

const sshSync = require('../lib/ssh');

exports.command = 'deploy <app>';
exports.desc = 'Deploy iTrust';
exports.builder = yargs => {
    yargs.options({
        itrustFile: {
            describe: 'Provide the path to the main itrust_deploy.yml',
            type: 'string',
            default: 'itrust_deploy.yml'
        },      
        checkboxFile: {
            describe: 'Provide the path to the main checkbox_deploy.yml',
            type: 'string',
            default: 'checkbox_deploy.yml'
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
    const { app, itrustFile, checkboxFile, inventory } = argv;
    (async () => {
        await run(app, itrustFile, checkboxFile, inventory);
    })();
};

async function run(app, itrustFile, checkboxFile, inventory) {
    
    let basic_filePath = "/bakerx/pipeline/";
    let inventoryPath = basic_filePath + inventory;
    let playbook_name = "";

    if(app == "iTrust"){
        playbook_name = basic_filePath + itrustFile;
        console.log(playbook_name);
    }else if(app == "checkbox.io"){
        playbook_name = basic_filePath + checkboxFile;
        console.log(playbook_name);
    }

    console.log('Running playbook for Deployment')
    result = sshSync(`ansible-playbook ${playbook_name} -i ${inventoryPath}`, 'vagrant@192.168.33.11');
    if( result.error ) { process.exit( result.status ); }

}

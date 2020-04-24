const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');

require('dotenv').config()

const sshSync = require('../lib/ssh');

exports.command = 'deploy <app>';
exports.desc = 'Deploy itrust';
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
        },
        vaultpass: {
            alias: 'vp',
            describe: 'the password to use for ansible vault',
            default: 'DEVOPS16',
            type: 'string'
        }
    });
};

exports.handler = async argv => {
    const { app, itrustFile, checkboxFile, inventory, vaultpass } = argv;
    (async () => {
        await run(app, itrustFile, checkboxFile, inventory, vaultpass);
    })();
};

async function run(app, itrustFile, checkboxFile, inventory, vaultpass) {
    
    let basic_filePath = "/bakerx/pipeline/";
    let inventoryPath = basic_filePath + inventory;
    let playbook_name = "";

    if(vaultpass)
    {
        console.log(chalk.bgCyan('Creating the vault password file on the configuration server in /tmp'));
        result = sshSync (`"echo ${vaultpass} > /tmp/.vault_pass"`, 'vagrant@192.168.33.11');
        result = sshSync("chmod '0600' /tmp/.vault_pass", 'vagrant@192.168.33.11');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }
    }

    let vaultPath = '/tmp/.vault_pass';

    if(app == "iTrust"){
        playbook_name = basic_filePath + itrustFile;
        console.log(playbook_name);
    }else if(app == "checkbox.io"){
        playbook_name = basic_filePath + checkboxFile;
        console.log(playbook_name);
    }

    console.log('Running playbook for Deployment')
    result = sshSync(`ansible-playbook --vault-password-file=${vaultPath} ${playbook_name} -i ${inventoryPath}`, 'vagrant@192.168.33.11');
    if( result.error ) { process.exit( result.status ); }

}

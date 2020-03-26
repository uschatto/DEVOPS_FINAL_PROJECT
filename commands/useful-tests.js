const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');
require('dotenv').config();

const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');

exports.command = 'useful-tests';
exports.desc = 'Initiate analysis of test suite for iTrust to run `-c` numbers of times';
exports.builder = yargs => {
    yargs.options({
        file: {
            describe: 'Provide the path to the main playbook.yml',
            type: 'string',
            default: 'pipeline/fuzzer.yml'
        },
        inventory: {
            describe: 'Provide the path to the inventory file',
            type: 'string',
            default: 'pipeline/inventory.ini'
        },
        vaultpass: {
            alias: 'vp',
            describe: 'the password to use for ansible vault',
            default: 'DEVOPS16',
            type: 'string'
        },
	    count: {
            alias: 'c',
	        describe: 'test suite for iTrust to run `-c` numbers of times.',
            type: 'int',
            default: 5
        }
    });
};


exports.handler = async argv => {
    const { file, inventory, vaultpass, count } = argv;
    (async () => {

        if (fs.existsSync(path.resolve(file)) && fs.existsSync(path.resolve(inventory))) 
        {
             await run( file, inventory, vaultpass, count );
        }
        else
        {
             console.error(`'File or inventory dont exist. Make sure to provide path from root of pipeline directory'`);  
        }          

    })();

};

async function run(file, inventory, vaultpass, count) {

    // the paths should be from root of pipeline directory
    // Transforming path of the files in host to the path in VM's shared folder
    let filePath = '/bakerx/'+ file;
    let inventoryPath = '/bakerx/' +inventory;

    let vaultPath = '/tmp/.vault_pass';

    console.log(chalk.blueBright('Running ansible script for useful-tests...'));
    result = sshSync(`/bakerx/pipeline/run-ansible.sh ${filePath} ${inventoryPath} ${vaultPath} ${count}`, 'vagrant@192.168.33.11');
    if( result.error ) { process.exit( result.status ); }
}

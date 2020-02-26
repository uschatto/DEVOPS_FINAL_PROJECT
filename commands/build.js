const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');

const sshSync = require('../lib/ssh');

exports.command = 'build <app>';
// Trigger a build job (named checkbox.io), wait for output, and print build log.
exports.desc = 'Trigger a build job checkbox.io';
exports.builder = yargs => {
    yargs.options({
        inventory: {
            describe: 'Provide the path to the inventory file',
            type: 'string',
            default: 'pipeline/inventory.ini'
        }
    });
};

exports.handler = async argv => {

    const {app, inventory} = argv;
    let file = "";
    if( app === "checkbox.io")
    {
        file = "pipeline/checkboxio.yml"
    }
    (async () => {

        if (fs.existsSync(path.resolve(file)) && fs.existsSync(path.resolve(inventory))) {
            await run(file, inventory);
        }

        else {
            console.error(`File or inventory don't exist. Make sure to provide path from root of cm directory`);
        }

    })();

};

async function run(file, inventory) {

    // the paths should be from root of cm directory
    // Transforming path of the files in host to the path in VM's shared folder
    let filePath = '/bakerx/'+ file;
    let inventoryPath = '/bakerx/' +inventory;

    let vaultPath = '/tmp/.vault_pass';

    console.log(chalk.blueBright('Running ansible script...'));
    let result = sshSync(`/bakerx/pipeline/run-ansible.sh ${filePath} ${inventoryPath} ${vaultPath}`, 'vagrant@192.168.33.11');
    if( result.error ) { process.exit( result.status ); }

}

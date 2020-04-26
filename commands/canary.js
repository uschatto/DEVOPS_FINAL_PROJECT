const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');

const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');

exports.command = 'canary <branch1> <branch2>';
exports.desc = 'Provision and configure the configuration server';
exports.builder = yargs => {
    yargs.options({
        file: {
            describe: 'Provide the path to the main playbook.yml',
            type: 'string',
            default: 'pipeline/canary.yml'
        },
        inventory: {
            describe: 'Provide the path to the inventory file',
            type: 'string',
            default: 'pipeline/inventory.ini'
        }
    });
};


exports.handler = async argv => {
    const { file,inventory, branch1, branch2 } = argv;
    (async () => {
        if (fs.existsSync(path.resolve(file)) && fs.existsSync(path.resolve(inventory)))
        { 
        await create_vm( file, inventory, branch1, branch2 );
        }
        else
        {
            console.error(`'File or inventory dont exist. Make sure to provide path from root of pipeline directory'`);
        }
    })();

};

async function create_vm(file, inventory, branch1, branch2) {

    console.log(chalk.greenBright('Installing proxy server!'));

    console.log(chalk.blueBright('Provisioning proxy server...'));
    let result = child.spawnSync(`bakerx`, `run proxy bionic --ip 192.168.44.20`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Provisioning master server...'));
    result = child.spawnSync(`bakerx`, `run master bionic --ip 192.168.44.25`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Provisioning broken server...'));
    result = child.spawnSync(`bakerx`, `run broken bionic --ip 192.168.44.30 `.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    let filePath = '/bakerx/'+ file;
    let inventoryPath = '/bakerx/' +inventory;

    console.log(chalk.cyanBright('Running ansible playbook for master and broken vms'))
    result = sshSync(`ansible-playbook ${filePath} -i ${inventoryPath} -e "branch1=${branch1}" -e "branch2=${branch2}"`, 'vagrant@192.168.33.11');
    if( result.error ) { process.exit( result.status ); }
}

   

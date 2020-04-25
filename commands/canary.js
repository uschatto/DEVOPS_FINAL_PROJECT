const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');

const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');

exports.command = 'canary <vm1> <vm2>';
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
        },
        vaultpass: {
            alias: 'vp',
            describe: 'the password to use for ansible vault',
            default: 'DEVOPS16',
            type: 'string'
        },
    });
};


exports.handler = async argv => {
    const { file,inventory, vaultpass, vm1, vm2 } = argv;
    (async () => {
        if (fs.existsSync(path.resolve(file)) && fs.existsSync(path.resolve(inventory)))
        { 
        await create_vm( file, inventory, vaultpass );
        }
        else
        {
            console.error(`'File or inventory dont exist. Make sure to provide path from root of pipeline directory'`);
        }
    })();

};

async function create_vm(file, inventory, vaultpass) {

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

    if(vaultpass)
    {
        console.log(chalk.bgCyan('Creating the vault password file on the configuration server in /tmp'));
        result = sshSync (`"echo ${vaultpass} > /tmp/.vault_pass"`, 'vagrant@192.168.33.11');
        result = sshSync("chmod '0600' /tmp/.vault_pass", 'vagrant@192.168.33.11');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }
    }

    let vaultPath = '/tmp/.vault_pass';

    console.log(chalk.cyanBright('Running ansible playbook for master and broken vms'))
    result = sshSync(`ansible-playbook ${filePath} -i ${inventoryPath} --vault-password-file=${vaultPath}`, 'vagrant@192.168.33.11');
    if( result.error ) { process.exit( result.status ); }
}

   

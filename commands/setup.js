const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');

const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');

exports.command = 'setup';
exports.desc = 'Provision and configure the configuration server';
exports.builder = yargs => {
    yargs.options({
        privateKey: {
            describe: 'Install the provided private key on the configuration server',
            type: 'string'
        },
        file: {
            describe: 'Provide the path to the main playbook.yml',
            type: 'string',
            default: 'pipeline/playbook.yml'
        },
        inventory: {
            describe: 'Provide the path to the inventory file',
            type: 'string',
            default: 'pipeline/inventory.ini'
        }
    });
};


exports.handler = async argv => {
    const { privateKey, file, inventory } = argv;

    (async () => {

        if (fs.existsSync(path.resolve(file)) && fs.existsSync(path.resolve(inventory))) 
        {
             await run( privateKey, file, inventory );
        }
        else
        {
             console.error(`File or inventory don't exist. Make sure to provide path from root of pipeline directory`);  
        }          

    })();

};

async function run(privateKey, file, inventory) {

    console.log(chalk.greenBright('Installing configuration server!'));

    console.log(chalk.blueBright('Provisioning configuration server...'));
    let result = child.spawnSync(`bakerx`, `run ansible-srv bionic --ip 192.168.33.11 --sync`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Provisioning mattermost server...'));
    result = child.spawnSync(`bakerx`, `run jenkins-srv bionic --ip 192.168.33.20`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Installing privateKey on configuration server'));
    let identifyFile = privateKey || path.join(os.homedir(), '.bakerx', 'insecure_private_key');
    result = scpSync (identifyFile, 'vagrant@192.168.33.11:/home/vagrant/.ssh/mm_rsa');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    result = sshSync('chmod +x /bakerx/pipeline/server-init.sh', 'vagrant@192.168.33.11');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    
    result = sshSync('chmod +x /bakerx/pipeline/run-ansible.sh', 'vagrant@192.168.33.11');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    
    console.log(chalk.blueBright('Running init script...'));
    result = sshSync('/bakerx/pipeline/server-init.sh', 'vagrant@192.168.33.11');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    // the paths should be from root of pipeline directory
    // Transforming path of the files in host to the path in VM's shared folder
    let filePath = '/bakerx/'+ file;
    let inventoryPath = '/bakerx/' +inventory;

    console.log(chalk.blueBright('Running ansible script...'));
    result = sshSync(`/bakerx/pipeline/run-ansible.sh ${filePath} ${inventoryPath}`, 'vagrant@192.168.33.11');
    if( result.error ) { process.exit( result.status ); }
}

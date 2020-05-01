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
            default: 'inventory.ini'
        },
        vaultpass: {
            alias: 'vp',
            describe: 'the password to use for ansible vault',
            default: 'DEVOPS16',
            type: 'string'
        },
        "gh-user": {
            describe: 'the github user',
            default: '',
            type: 'string'
        },
        "gh-pass": {
            describe: 'the password to the github user',
            default: '',
            type: 'string'
        }
    });
};


exports.handler = async argv => {
    const { privateKey, file, inventory, vaultpass } = argv;
    let ghUser = argv['gh-user'];
    let ghPass = argv['gh-pass'];
    (async () => {

        if (fs.existsSync(path.resolve(file)) && fs.existsSync(path.resolve(inventory))) 
        {
             await run( privateKey, file, inventory, vaultpass, ghUser, ghPass );
        }
        else
        {
             console.error(`'File or inventory dont exist. Make sure to provide path from root of pipeline directory'`);  
        }          

    })();

};

async function run(privateKey, file, inventory, vaultpass, ghUser, ghPass) {

    console.log(chalk.greenBright('Installing configuration server!'));

    console.log(chalk.blueBright('Provisioning configuration server...'));
    let result = child.spawnSync(`bakerx`, `run ansible-srv bionic --ip 192.168.33.11 --sync`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Provisioning jenkins server...'));
    result = child.spawnSync(`bakerx`, `run jenkins-srv bionic --ip 192.168.33.20  --memory 3072`.split(' '), {shell:true, stdio: 'inherit'} );
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

    if(vaultpass)
    {
        console.log(chalk.bgCyan('Creating the vault password file on the configuration server in /tmp'));
        result = sshSync (`"echo ${vaultpass} > /tmp/.vault_pass"`, 'vagrant@192.168.33.11');
        result = sshSync("chmod '0600' /tmp/.vault_pass", 'vagrant@192.168.33.11');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }
    }

    let vaultPath = '/tmp/.vault_pass';

    // This is to encode the password in case there are any special characters
    if(ghPass)
    {
        ghPass = encodeURIComponent(ghPass);
    }

    console.log(chalk.blueBright('Running ansible script...'));
    result = sshSync(`/bakerx/pipeline/run-ansible.sh ${filePath} ${inventoryPath} ${vaultPath} ${ghUser} ${ghPass}`, 'vagrant@192.168.33.11');
    if( result.error ) { process.exit( result.status ); }
}

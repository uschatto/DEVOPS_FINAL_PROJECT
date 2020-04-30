const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');
const http = require('http')
const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');

var options = {
    host: '192.168.44.20',
    port: 3000,
    path: '/preview',
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
    }
};

var data = fs.readFileSync(__dirname+'/../resources/survey.json','utf-8');

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
            let start = Date.now();
            let end = 0;
            const interval = setInterval(async function(){ 
                await generate_load();
                end = Date.now();
                if(end - start >= 600000)
                {
                     clearInterval(interval);
                     console.log("End of 10 minutes");
                }
            }, 1000);
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

    console.log(chalk.blueBright('Provisioning BLUE server...'));
    result = child.spawnSync(`bakerx`, `run BLUE bionic --ip 192.168.44.25`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Provisioning GREEN server...'));
    result = child.spawnSync(`bakerx`, `run GREEN bionic --ip 192.168.44.30 `.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    let filePath = '/bakerx/'+ file;
    let inventoryPath = '/bakerx/' +inventory;

    console.log(chalk.cyanBright(`Setting ${branch1} on BLUE vm and ${branch2} on GREEN vm`));
    result = sshSync(`ansible-playbook ${filePath} -i ${inventoryPath} -e "branch1=${branch1}" -e "branch2=${branch2}"`, 'vagrant@192.168.33.11');
    if( result.error ) { process.exit( result.status ); }
}

   
async function generate_load(){
    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + res);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
        });
      });
      
      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      
      // write data to request body
      req.write(data);
      req.end();
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

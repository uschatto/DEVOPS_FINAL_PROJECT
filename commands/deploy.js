const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');

require('dotenv').config()
let url = "http://" + process.env.JENKINS_USER + ":" + process.env.JENKINS_PASS + "@" + process.env.JENKINS_URL
const jenkins = require('jenkins')({ baseUrl : url, crumbIssuer: true, promisify: true });

const sshSync = require('../lib/ssh');

exports.command = 'deploy <app>';
exports.desc = 'Deploy app';
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
            default: 'inventory.ini',
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
    
    let basePath = "/bakerx/pipeline/";
    let inventoryPath = basePath + inventory;
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
        playbook_name = basePath + itrustFile;
        await triggerBuildAndCreateWarAndDeploy(app,vaultPath,playbook_name, inventoryPath);
    }else if(app == "checkbox.io"){
        playbook_name = basePath + checkboxFile;
        deployApps(app,vaultPath,playbook_name, inventoryPath)
    }
}

async function waitOnQueue(id) {
    return new Promise(function(resolve,reject)
    {
          jenkins.queue.item(id, function(err,item) {
		if(err) throw err;
		if(item.executable) {
			console.log("number:",item.executable.number);
			resolve(item.executable.number);
		}
		else if (item.cancelled)
		{
			console.log("cancelled");
			reject("cancelled");
		}
		else {
			setTimeout(async function() {
				resolve(await waitOnQueue(id));
			}, 5000);
		}
          });

    });
}

async function triggerBuild(job) {
    let queueId = await jenkins.job.build(job);
    let buildId = await waitOnQueue(queueId);
    return buildId;
}

async function triggerBuildAndCreateWarAndDeploy(app,vaultPath,playbook_name, inventoryPath){
    let buildId = await triggerBuild(process.env.JENKINS_JOB_ITRUST).catch( e => console.log(e));
    console.log(chalk.blueBright(`Build number :  ${buildId}`));

    console.log(chalk.green(`Build output`));
    var log = jenkins.build.logStream(process.env.JENKINS_JOB_ITRUST, buildId);
 
    log.on('data', function(text) {
      process.stdout.write(text);
    });
 
    log.on('error', function(err) {
      console.log('error', err);
    });
 
    log.on('end', function() {
      console.log('end');
      copyWarFile();
      copySqlDumpFile();
      deployApps(app,vaultPath,playbook_name, inventoryPath);
    });
}

function copyWarFile() {
    result = sshSync(`scp -i ~/.ssh/mm_rsa vagrant@192.168.33.20:${process.env.JENKINS_WAR_PATH} ${process.env.ITRUST_TEMPLATES_PATH}`,'vagrant@192.168.33.11');       
    if( result.error ) { process.exit( result.status ); }
    else{ console.log(chalk.green(("Successfully copied iTrust war file"))); }
}

function copySqlDumpFile() {
    result = sshSync(`scp -i ~/.ssh/mm_rsa vagrant@192.168.33.20:${process.env.JENKINS_SQL_DUMP_PATH} ${process.env.ITRUST_TEMPLATES_PATH}`,'vagrant@192.168.33.11'); 
    if( result.error ) { process.exit( result.status ); } 
    else{ console.log(chalk.green(("Successfully copied iTrust sql dump file"))); }
}

function deployApps(app,vaultPath,playbook_name, inventoryPath){
    console.log(`Running playbook for deployment of ${app}`)
    result = sshSync(`ansible-playbook --vault-password-file=${vaultPath} ${playbook_name} -i ${inventoryPath}`, 'vagrant@192.168.33.11');
    if( result.error ) { process.exit( result.status ); }
}

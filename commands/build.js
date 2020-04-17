const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');

require('dotenv').config()
let url = "http://" + process.env.JENKINS_USER + ":" + process.env.JENKINS_PASS + "@" + process.env.JENKINS_URL
const jenkins = require('jenkins')({ baseUrl : url, crumbIssuer: true, promisify: true });

const sshSync = require('../lib/ssh');

exports.command = 'build <app>';
// Trigger a build job (named checkbox.io), wait for output, and print build log.
exports.desc = 'Trigger a build job checkbox.io';
exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    const { app } = argv;
    (async () => {
        await run(app);
    })();
};

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

async function run(app) {

    let job_name = "";

    if(app == "iTrust"){
        job_name = process.env.JENKINS_JOB_ITRUST;
    }else if(app == "checkbox.io"){
      job_name = process.env.JENKINS_JOB_NAME;
    }

    console.log(chalk.blueBright(`Triggering build for ${job_name}`));
    let buildId = await triggerBuild(job_name).catch( e => console.log(e));
    
    console.log(chalk.blueBright(`Build number :  ${buildId}`));

    console.log(chalk.green(`Build output`));
    var log = jenkins.build.logStream(job_name, buildId);
 
    log.on('data', function(text) {
      process.stdout.write(text);
    });
 
    log.on('error', function(err) {
      console.log('error', err);
    });
 
    log.on('end', function() {
      console.log('end');
    });
}

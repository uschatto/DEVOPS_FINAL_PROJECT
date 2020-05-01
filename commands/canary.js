const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');
const http = require('http')
const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');
var mwu = require('mann-whitney-utest');

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
            default: 'inventory.ini'
        }
    });
};

let canaryMap = new Map();

let healthBlue = new Map();
healthBlue.set("statusCode",[]);
healthBlue.set("latency",[]);
healthBlue.set("cpu",[]);
healthBlue.set("memory",[]);

let healthGreen = new Map();
healthGreen.set("statusCode",[]);
healthGreen.set("latency",[]);
healthGreen.set("cpu",[]);
healthGreen.set("memory",[]);

exports.handler = async argv => {
    const { file,inventory, branch1, branch2 } = argv;
    (async () => {
        if (fs.existsSync(path.resolve(file)) && fs.existsSync(path.resolve(inventory)))
        { 
            await create_vm( file, inventory, branch1, branch2 );
            let start = Date.now();
            let end = 0;
            canaryMap.set("BLUE",healthBlue);
            canaryMap.set("GREEN",healthGreen);
            console.log("Generating load on BLUE vm for 5 minutes and GREEN vm for 5 minutes"); 
            const interval = setInterval(async function(){ 
                await generate_load();
                end = Date.now();
                if(end - start >= 600000)
                {
                     clearInterval(interval);
                     console.log("End of load generation");
                     console.log("*****************************************************************************************************");
                     console.log("Computing Canary Score based on StatusCode, CPU, Memory and Latency metrics using Mann Whitney U Test");
                     var canaryScore = [];
                     var counterPass = 0;

                     var samplesStatusCode = [];
                     var weightStatusCode = 4;
                     samplesStatusCode.push((canaryMap.get("BLUE")).get("statusCode"));
                     samplesStatusCode.push((canaryMap.get("GREEN")).get("statusCode"));
                     var usc = mwu.test(samplesStatusCode);
                     if (mwu.significant(usc, samplesStatusCode)) 
                     {
                           console.log('Status Code : The difference between data is significant!');
                           canaryScore.push("FAIL");
                     }	 
                     else 
                     {
                           console.log('Status Code : The difference between data is not significant!');
                           canaryScore.push("PASS");
                           counterPass = counterPass + weightStatusCode;
                     }

                     var samplesLatency = [];
                     var weightLatency = 2;
                     samplesLatency.push((canaryMap.get("BLUE")).get("latency"));
                     samplesLatency.push((canaryMap.get("GREEN")).get("latency"));
                     var ul = mwu.test(samplesLatency);
                     if (mwu.significant(ul, samplesLatency)) 
                     {
                           console.log('Latency : The difference between data is significant!');
                           canaryScore.push("FAIL");
                     }	 
                     else 
                     {
                           console.log('Latency : The difference between data is not significant!');
                           canaryScore.push("PASS");
                           counterPass = counterPass + weightLatency;
                     }

                     var samplesCPU = [];
                     var weightCPU = 2; 
                     samplesCPU.push((canaryMap.get("BLUE")).get("cpu"));
                     samplesCPU.push((canaryMap.get("GREEN")).get("cpu"));
                     var uc = mwu.test(samplesCPU);
                     if (mwu.significant(uc, samplesCPU))
                     {
                           console.log('CPU : The difference between data is significant!');
                           canaryScore.push("FAIL");
                     }
                     else 
                     {
                           console.log('CPU : The difference between data is not significant!');
                           canaryScore.push("PASS");   
                           counterPass = counterPass + weightCPU; 
                     }

                     var samplesMemory = [];
                     var weightMemory = 2; 
                     samplesMemory.push((canaryMap.get("BLUE")).get("memory"));
                     samplesMemory.push((canaryMap.get("GREEN")).get("memory"));
                     var um = mwu.test(samplesMemory);
                     if (mwu.significant(um, samplesMemory))
                     {
                           console.log('Current Memory : The difference between data is significant!');
                           canaryScore.push("FAIL");
                     }
                     else 
                     {
                           console.log('Current Memory : The difference between data is not significant!');
                           canaryScore.push("PASS");   
                           counterPass = counterPass + weightMemory; 
                     }

                     var pass = (counterPass/10);
                     console.log("Canary Score : " + (pass)*100 + "%");

                     if (pass >= 0.7)
                     {
                          console.log(chalk.greenBright('canary passed!')); 
                     }
                     else
                     {
                           console.log(chalk.red('canary failed'));
                     }
                     
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
    let start = Date.now();
    let end = 0;
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          end = Date.now();
          if("BLUE" == JSON.parse(chunk)['name'] && JSON.parse(chunk)['status'] != "#cccccc")
          {
                (canaryMap.get("BLUE")).get("statusCode").push(JSON.parse(chunk)['status']);
                (canaryMap.get("BLUE")).get("cpu").push(JSON.parse(chunk)['cpu']);
                (canaryMap.get("BLUE")).get("memory").push(JSON.parse(chunk)['memoryLoad']);
                (canaryMap.get("BLUE")).get("latency").push(end-start);
          }
          if("GREEN" == JSON.parse(chunk)['name'] && JSON.parse(chunk)['status'] != "#cccccc")
          {
                (canaryMap.get("GREEN")).get("statusCode").push(JSON.parse(chunk)['status']);
                (canaryMap.get("GREEN")).get("cpu").push(JSON.parse(chunk)['cpu']);
                (canaryMap.get("GREEN")).get("memory").push(JSON.parse(chunk)['memoryLoad']);
                (canaryMap.get("GREEN")).get("latency").push(end-start);
          }
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

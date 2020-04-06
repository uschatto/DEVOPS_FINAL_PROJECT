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
	    count: {
            alias: 'c',
	        describe: 'test suite for iTrust to run `-c` numbers of times.',
            type: 'int',
            default: 5
        }
    });
};


exports.handler = async argv => {
    const { count } = argv;
    (async () => {
        await run( count );
    })();

};

async function run(count) {

    console.log(chalk.blueBright('Running fuzzer.js for useful-tests...'))
    result = sshSync(`node fuzzer.js ${count}`, 'vagrant@192.168.33.20');
    if( result.error ) { process.exit( result.status ); }
}

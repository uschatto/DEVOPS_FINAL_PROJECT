const child = require('child_process');
const chalk = require('chalk');
const os = require('os');
const got = require('got');
const fs = require('fs');
const sshSync = require('../lib/ssh');

var config = {};
var ids = {};
// Retrieve our api token from the environment variables.

exports.command = 'prod <up>';
// Command => pipeline prod up
exports.desc = 'Provision cloud instances and control plane';
exports.builder = yargs => {
    yargs.options({
    });
};
config.token = process.env.NCSU_DOTOKEN;
if( !config.token )
{
    console.log(chalk`{red.bold NCSU_DOTOKEN is not defined!}`);
    console.log(`Please set your environment variables with appropriate token.`);
    console.log(chalk`{italic You may need to refresh your shell in order for your changes to take place.}`);
    process.exit(1);
}
// Configure our headers to use our token when making REST api requests.
const headers =
{
    'Content-Type':'application/json',
    Authorization: 'Bearer ' + config.token
};

exports.handler = async argv => {
    const { up } = argv;
    (async () => {
        if (up == 'up'){
          await run();
        }
    })();
};

class DigitalOceanProvider{

    async createVm (name, region, image, key_list){

        var data = 
        {
          "name": name,
          "region":region,
          "size":"512mb",
          "image":image,
          "ssh_keys":key_list,
          "backups":false,
          "ipv6":false,
          "user_data":null,
          "private_networking":null
        };
        console.log("Attempting to create: "+ JSON.stringify(data) );

        let response = await got.post("https://api.digitalocean.com/v2/droplets", 
        {
          headers:headers,
          body: JSON.stringify(data)
        }).catch( err => 
          console.error(chalk.red(`createDroplet: ${err}`)) 
        );

        if( !response ) return;

        // console.log(response.statusCode);
        // console.log(typeof(response.body));
        let body = JSON.parse(response.body)

        if(response.statusCode == 202)
        {
                console.log(chalk.green(`Created droplet id ${body['droplet']['id']}`));
                if ( !ids.hasOwnProperty(name) ){
                  ids[name] = body['droplet']['id'];
                }
        }
    }

    async get_keys(){
      let keyurl = "https://api.digitalocean.com/v2/account/keys";
        let key_response = await got(keyurl,
        {
          headers: headers  
        }
        );
        let key_list = []
        let keyids_list = (JSON.parse(key_response.body))['ssh_keys'];
        console.log("SSH Keys ",keyids_list);
        keyids_list.forEach(element => {
          key_list.push(element['id'])
        });
        return key_list
    }

}

async function run() {
  let client = new DigitalOceanProvider();
  var image = "ubuntu-18-04-x64";
  var region = "blr1";
  var names = ['monitor','blue','green'];
  let key_list = await client.get_keys();
  for(var i = 0; i < names.length; i++){
    await client.createVm(names[i], region, image, key_list);
  }
  console.log("Droplet Ids: ", ids)
}

  

  

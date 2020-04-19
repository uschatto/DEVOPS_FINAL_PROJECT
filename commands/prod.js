const child = require('child_process');
const chalk = require('chalk');
const os = require('os');
const path = require('path')
const got = require('got');
const fs = require('fs');
var generateRSAKeypair = require('generate-rsa-keypair')
const sshpk = require('sshpk');
const sshSync = require('../lib/ssh');

var config = {};
var do_ids = {};
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
                if ( !do_ids.hasOwnProperty(name) ){
                  do_ids[name] = [body['droplet']['id']];
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
        // console.log("SSH Keys ",keyids_list);
        keyids_list.forEach(element => {
          key_list.push(element['id'])
        });
        return key_list
    }

    async get_ips(do_ids){
      let ip_url = 'https://api.digitalocean.com/v2/droplets/'
      for (var key in do_ids)
      {
        let response = await got(ip_url+do_ids[key][0] , {headers: headers})
               .catch(err => console.error(`dropletInfo ${err}`));
        if ( !response ) return;
        let body = JSON.parse(response.body)
        let droplet = body['droplet'];
        while ((droplet.networks.v4).length == 0){
          response = await got(ip_url+do_ids[key][0] , {headers: headers})
                .catch(err => console.error(`dropletInfo ${err}`));
          if ( !response ) return;
          body = JSON.parse(response.body)
          droplet = body['droplet'];
        }
        for( let ipv4 of droplet.networks.v4 )
        {
          // console.log('Ipv4'," ", ipv4.ip_address)
          do_ids[key].push(ipv4.ip_address)
        }
      }
    }

    async inventory(do_ids){
        var data = fs.readFileSync(__dirname+'/../pipeline/inventory.ini','utf-8');
        // console.log("Data:", data)
        let data_lines = data.split('\n')
        // console.log(data_lines)
        for (var key in do_ids){
          if (!data_lines.includes('['+key+']'))
            {
              data_lines.push('['+key+']')
              data_lines.push(do_ids[key][1]+"  ansible_ssh_private_key_file="+ __dirname+"/../devops  ansible_user=root")
            }
          else
            {
              let index = data_lines.indexOf('['+key+']')
              data_lines[index+1] = do_ids[key][1]+"  ansible_ssh_private_key_file="+ __dirname+"/../devops  ansible_user=root"
            }
        }
        // console.log("File:",data_lines)
        data = data_lines.join('\n')
        console.log("Data: ",data)
        fs.writeFileSync(__dirname+'/../pipeline/inventory.ini', data, 'utf-8');
      }

    async create_keypair(){
      var pair = generateRSAKeypair()
      const pemKey = sshpk.parseKey(pair.public, 'pem');
      const sshRsa = pemKey.toString('ssh');
      console.log("SSH_RSA:",sshRsa)
      var data_rsa = {
        "name":"devops",
        "public_key": sshRsa
      } 
      let response = await got.post( "https://api.digitalocean.com/v2/account/keys" , 
      {
        headers: headers,
        body: JSON.stringify(data_rsa) 
      }).catch(err => console.error(`dropletInfo ${err}`));
      fs.writeFileSync(__dirname+'/../devops',pair.private)
      fs.chmodSync(__dirname+'/../devops', 0o400)
    }

    async listvms(){ 
      let response = await got( "https://api.digitalocean.com/v2/droplets?page=1&per_page=100" , 
      {
        headers: headers
      }).catch(err => console.error(`dropletInfo ${err}`));
      let vm_list = []
      let vm_list_api = (JSON.parse(response.body))['droplets']
      vm_list_api.forEach(element => 
        vm_list.push(element['name']))

      return vm_list
    }
}

async function run() {
  let client = new DigitalOceanProvider();
  let vm_list = await client.listvms()
  // console.log("VMLIST:", vm_list)
  let names = []
  var names_list = ['monitor','iTrust','checkbox.io'];
  names_list.forEach(element => {
    if (!vm_list.includes(element)){
      names.push(element)
    }
  })
  // console.log("VM_LIST:",names)
  if(names.length == 0){
    console.log("VMs already exist. First delete them.")
    return
  }
  if (!fs.existsSync(path.resolve(__dirname+'/../devops'))){
    await client.create_keypair();
  }
  var image = "ubuntu-18-04-x64";
  var region = "blr1";
  let key_list = await client.get_keys();
  for(var i = 0; i < names.length; i++){
    await client.createVm(names[i], region, image, key_list);
  }
  await client.get_ips(do_ids)
  console.log("Droplet Ids: ", do_ids)
  await client.inventory(do_ids)
  }

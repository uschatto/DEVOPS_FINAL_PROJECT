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
let firewall_id = '';
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
          // await sleep(60000);
          await run_playbook();
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
        let config_lines = {}
        for (var key in do_ids){
          if (!data_lines.includes('['+key+']'))
            {
              data_lines.push('['+key+']')
              data_lines.push(key+" ansible_host="+do_ids[key][1]+"  ansible_ssh_private_key_file=/bakerx/pipeline/devops  ansible_user=root")
              data_lines.push('['+key+':vars]')
              data_lines.push('ansible_ssh_common_args=\'-o StrictHostKeyChecking=no\'')
            }
          else
            {
              let index = data_lines.indexOf('['+key+']')
              config_lines = {
                1:  key+" ansible_host="+do_ids[key][1]+"  ansible_ssh_private_key_file=/bakerx/pipeline/devops  ansible_user=root",
                2: '['+key+':vars]',
                3: 'ansible_ssh_common_args=\'-o StrictHostKeyChecking=no\''
              }
              for(var i = 1; i < 4; i++){
                if (index + i < data_lines.length){
                  data_lines[index+i] = config_lines[i]
                }
                else{
                  data_lines.push(config_lines[i])
                }
              }
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
      fs.writeFileSync(__dirname+'/../pipeline/devops',pair.private)
      fs.chmodSync(__dirname+'/../pipeline/devops', 0o400)
    }

    async listvms(){ 
      let response = await got( "https://api.digitalocean.com/v2/droplets?page=1&per_page=100" , 
      {
        headers: headers
      }).catch(err => console.error(`dropletInfo ${err}`));
      let vm_list = []
      let vm_list_api = (JSON.parse(response.body))['droplets']
      // console.log("VM_LIST_API:", vm_list_api)
      vm_list_api.forEach(element => 
        vm_list.push(element['name']))

      return vm_list
    }

    async create_firewall(list_do_ids, fire_name){
      var firewall_data = 
      {
        "name": "firewall16",
        "inbound_rules": [
          {
            "protocol": "tcp",
            "ports": "22-443",
            "sources": {
              "addresses": ["0.0.0.0/0"]
            }
          },
          {
            "protocol": "tcp",
            "ports": "6379",
            "sources": {
              "addresses": ["0.0.0.0/0"]
            }
          },
          {
            "protocol": "tcp",
            "ports": "8080",
            "sources": {
              "addresses": ["0.0.0.0/0"]
            }
          },
          {
            "protocol": "tcp",
            "ports": "9001-9003",
            "sources": {
              "addresses": ["0.0.0.0/0"]
            }
          },
          {
            "protocol": "tcp",
            "ports": "3000",
            "sources": {
              "addresses": ["0.0.0.0/0"]
            }
          },
        ],
        "outbound_rules": [
          {
            "protocol": "tcp",
            "ports": "all",
            "destinations": {
              "addresses": ["0.0.0.0/0"]
            }
          },
          {
            "protocol": "udp",
            "ports": "53",
            "destinations": {
              "addresses": ["0.0.0.0/0"]
            }
          },
        ]
      };

      let response = await got.post("https://api.digitalocean.com/v2/firewalls", 
      {
        headers:headers,
        body: JSON.stringify(firewall_data)
      }).catch( err => 
        console.error(chalk.red(`createFirewall: ${err}`)) 
      );
      let fire_resp = (JSON.parse(response.body))['firewalls']
      while (fire_resp == null){
        response = await got("https://api.digitalocean.com/v2/firewalls", { headers:headers })
        fire_resp = (JSON.parse(response.body))['firewalls']
      }
      fire_resp.forEach(element => {
        if(element['name'] === "firewall16")
          {            
            firewall_id = element['id']
          }
      }) 
    }

    async add_droplets_firewall(list_do_ids){ 
      // Add droplets to to the firewall
      console.log("Firewall ID:",firewall_id)
      console.log("LIST DO IDS:",list_do_ids)
      let data = {
        "droplet_ids": list_do_ids
      }
      let url = "https://api.digitalocean.com/v2/firewalls/"+firewall_id+"/droplets";
      await got.post(url, 
      {
        headers:headers,
        body: JSON.stringify(data)
      }).catch( err => 
        console.error(chalk.red(`AddDropletsToFirewall: ${err}`)) 
      );
      // console.log(response.body)
    }

    async is_firewall(){
      let response = await got("https://api.digitalocean.com/v2/firewalls",{headers: headers})
      let fire_resp = (JSON.parse(response.body))['firewalls']
      let x = 0
      console.log("FIRE RESP:", fire_resp)
      if(fire_resp == null)
      {
        return 0
      }
      fire_resp.forEach(element => {
        if(element['name'] === "firewall16")
          {            
            firewall_id = element['id']
            x = 1
          }
      }) 
      return x
    }
}

async function run() {
  let client = new DigitalOceanProvider();
  let vm_list = await client.listvms()
  console.log("VMLIST:", vm_list)
  let names = []
  var names_list = ['monitor','iTrust','checkbox.io'];
  names_list.forEach(element => {
    if (!vm_list.includes(element)){
      names.push(element)
    }
  })
  console.log("VM_LIST:",names)
  if(names.length == 0){
    console.log("VMs already exist. First delete them.")
    return
  }
  if (!fs.existsSync(path.resolve(__dirname+'/../pipeline/devops'))){
    await client.create_keypair();
  }
  var image = "ubuntu-18-04-x64";
  var region = "nyc3";
  let key_list = await client.get_keys();
  for(var i = 0; i < names.length; i++){
    await client.createVm(names[i], region, image, key_list);
  }
  await client.get_ips(do_ids)
  console.log("Droplet Ids: ", do_ids)
  await client.inventory(do_ids) 
  let list_do_ids = []
  for (var key in do_ids){
    list_do_ids.push(do_ids[key][0])
  }
  let x = await client.is_firewall()
  console.log(x)
  if (x == 0){
    await client.create_firewall(list_do_ids,'firewall16')
    await client.add_droplets_firewall(list_do_ids,'firewall16')
  }
  else{
    await client.add_droplets_firewall(list_do_ids,'firewall16')
  }
}

async function run_playbook(){
  console.log('Running playbook for control plane')
  result = sshSync('ansible-playbook /bakerx/pipeline/prod.yml -i /bakerx/pipeline/inventory.ini', 'vagrant@192.168.33.11');
  if( result.error ) { process.exit( result.status ); }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

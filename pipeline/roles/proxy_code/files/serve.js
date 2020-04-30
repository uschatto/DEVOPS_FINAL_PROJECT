const chalk = require('chalk');
const path = require('path');
const os = require('os');
const redis = require('redis');
const got = require('got');
const http = require('http');
const httpProxy = require('http-proxy');

exports.command = 'serve';
exports.desc = 'Run traffic proxy.';
exports.builder = yargs => {};

exports.handler = async argv => {
    const { } = argv;

    (async () => {

        await run( );

    })();

};


const BLUE  = 'http://192.168.44.25:3000';
const GREEN = 'http://192.168.44.30:3000';
let client = redis.createClient(6379, 'localhost', {});
var servers =
[
    {name: "BLUE", url: BLUE, status: "#cccccc",},
    {name: "GREEN", url: GREEN, status: "#cccccc"}
];

for( var server of servers )
{
    // The name of the server is the name of the channel to recent published events on redis.
    client.subscribe(server.url);
}

client.on("message", function (channel, message)
{
     console.log(`Received message from agent: ${channel}`)
     for( var server of servers )
     {
          // Update our current snapshot for a server's metrics.
          if( server.url == channel)
          {
             let payload = JSON.parse(message);
              server.memoryLoad = payload.memoryLoad;
              server.cpu = payload.cpu;
              server.uptime = payload.uptime;
          }
	  // console.log("Server:", server.name, "server:", server);
      }
});
class Production
{
     constructor()
     {
      this.TARGET = BLUE;
      setInterval( this.b2g.bind(this), 300000)
     }

    proxy()
    {  
        let options = {};
        let proxy   = httpProxy.createProxyServer(options);
        let self = this;
        // Redirect requests to the active TARGET (BLUE or GREEN)
        let server  = http.createServer(function(req, res)
        {
        console.log("TARGET:", self.TARGET)
            proxy.web(req, res, {target: self.TARGET})
	    for (var server of servers ){
	        if (server.url == self.TARGET)
		{
		    server.status = res.statusCode;
		    //server.latency = res.timings;
		   
		}
	    }
	    //console.log("Server:", servers)
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write('request successfully proxied!' + '\n' + JSON.stringify(servers, true, 2));
            res.end();
        });
        server.listen(3000);
   }

   b2g()
   {

      this.TARGET = (this.TARGET==BLUE) ? GREEN:BLUE;
   }

   async healthCheck()
   {
      try 
      {
         const response = await got(this.TARGET, {throwHttpErrors: false});
         let status = response.statusCode == 200 ? chalk.green(response.statusCode) : chalk.red(response.statusCode);
         console.log( chalk`{grey Health check on ${this.TARGET}}: ${status}`);
      }
      catch (error) {
         console.log(error);
      }
   }
       
}

async function run() {

    console.log(chalk.keyword('pink')('Starting proxy on localhost:3000'));

    let prod = new Production();
    prod.proxy();

}

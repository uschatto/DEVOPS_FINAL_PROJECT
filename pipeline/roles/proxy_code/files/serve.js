const chalk = require('chalk');
const path = require('path');
const os = require('os');

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

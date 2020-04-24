const express = require('express')
const app = express()
const port = 3000
const host = getIPAddress();
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, host, () => console.log(`Example app listening at http://${host}:${port}`))


function getIPAddress() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
    }
  }

  return '0.0.0.0';
}


var server = require('http').createServer()
  , url = require('url')
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ server: server })
  , express = require('express')
  , app = express()
  , port = 8080;

var path = require('path');
var saving = false;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.render('index');
});

var clients = [];
var sensors = [];
wss.on('connection', function connection(ws) {
  if(ws.protocol != "arduino"){
    console.log("agregar navegador");
    clients.push(ws);
  }else if(ws.protocol == "arduino"){
    console.log("agregar sensor");
    sensors.push(ws);
  }

  ws.on('message', function incoming(message) {
    console.log(message);
    //var obj = JSON.parse(message);
    //console.log(parseInt(obj.value));

    clients.forEach(function(client) {
      client.send(message, function ack(error){
        // if error is not defined, the send has been completed,
        // otherwise the error object will indicate what failed.
      });
    });
  });

  ws.on('close', function() {
    //remove the client from clients list
    if (clients[ws] != null){
      delete clients[ws];
      console.log('Quitar cliente');
    }
  });
});

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });

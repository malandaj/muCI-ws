var server = require('http').createServer()
  , url = require('url')
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ server: server })
  , express = require('express')
  , app = express()
  , port = 8080;

var SerialPort = require("serialport");
var sPort = new SerialPort("/dev/ttyACM0", {
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false,
  parser: SerialPort.parsers.readline('\r\n')
});

sPort.on('open', function() {
  console.log('Port open');
  sPort.on('data', function(data) {
    console.log('data received: ' + data);
  });
});

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
    var lecture = JSON.parse(message);
    //console.log(lecture);
    //console.log(parseInt(lecture.value));
    var leds = map(parseInt(lecture.value),0,750,0,73);
    //console.log(leds);
    sPort.write(leds+'\r\n');
    // sPort.write("50", function(err, results) {
    //   if(err){
    //     console.log('err ' + err);
    //   }
    //     console.log('results ' + results);
    // });
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

function map(x,in_min,in_max,out_min,out_max){
    if(x > in_max){
      x = in_max
    }
    return Math.round((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
}

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });

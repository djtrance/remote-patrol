<<<<<<< HEAD
var http = require("http"),


var server = http.createServer(function(req, res) {
  require("fs").createReadStream(__dirname + "/index.html").pipe(res);
});

server.listen(8080);
=======
var express = require('express');
var app = express();

app.get('/frontLoader', function(req, res){
  res.send("<html><head><title>TheApp!</title></head><body><p>TOLD YOU I COULD DO IT</p></body></html>");
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
>>>>>>> 51d27404610eeddb6e9a010c25c66fbf51726e75

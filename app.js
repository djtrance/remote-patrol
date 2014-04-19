var express = require('express');
var app = express();

app.get('/frontLoader', function(req, res){
  res.send("<html><head><title>TheApp!</title></head><body><p>TOLD YOU I COULD DO IT</p></body></html>");
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
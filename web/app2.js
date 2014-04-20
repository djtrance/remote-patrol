var fs = require('fs');
var express = require('express');
var app = express();

/*app.get('/frontLoader', function(req, res){
	res.send("document.write(" + fs.readFile('./landing.js', function (err, data) {
	  if (err) throw err;
	  return data;
	  //res.send(data);
	  //console.log(data);
	})
+ ");")
});*/

//app.get('/frontLoader', 
app.use(express.static(__dirname + './public'));

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
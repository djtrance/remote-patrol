var fs = require('fs');
var express = require('express');
var app = express();

app.use(express.static(__dirname + './public'));

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

var front = false;
var back = false;
var left = false;
var right = false;
var up = false;
var down = false;
var override = false;

app.get('/', function(req, res){
	res.sendfile("./public/index.html");
})
app.get('/style.css', function(req, res){
	res.sendfile("./public/style.css");
})
app.get('/WebFunctions.js', function(req, res){
	res.sendfile("./public/WebFunctions.js");
})
app.get('/components/jquery/jquery.js', function(req, res){
	res.sendfile("./components/jquery/jquery.js");
})
app.get('/update', function(req, res){
	res.send(true);
})
app.get('/act', function(req, res){
	console.log(req.param('act'));
	if(req.param('act')=="front")
	{
		front = true;
	}
	if(req.param('act')=="back")
	{
		back = true;
	}
	if(req.param('act')=="left")
	{
		left = true;
	}
	if(req.param('act')=="right")
	{
		right = true;
	}
	if(req.param('act')=="up")
	{
		up = true;
	}
	if(req.param('act')=="down")
	{
		down = true;
	}
	res.send(true);
})
app.get('/off', function(req, res){
	console.log("off");
	var front = false;
	var back = false;
	var left = false;
	var right = false;
	var up = false;
	var down = false;
	res.send(true);
})

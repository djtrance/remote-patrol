//--------Sets up camera stream server
var express = require('express');
var http = require('http');
var routes = require('./routes');
var app2 = express();
var path = require('path');
  //var server = require('http');
//server.createServer(app);



//-------More for camera stream server
var server2 = http.createServer(app2);

//app.set('view engine', 'ejs');


//app.configure(function () {
    //app2.set('views', __dirname + '/views');
    app2.set('view engine', 'jade', { pretty: true });
    //app2.use(express.favicon());
    //app.use(express.logger('dev'));
    app2.use(app2.router);
    app2.use(express.static(path.join(__dirname, 'public')));
//});
/*
app.configure('development', function () {
    app.use(express.errorHandler());
    app.locals.pretty = true;
});*/

app2.get('/', routes.index);

/*
 * Important:
 *
 * pass in the server object to listen, not the express app
 * call 'listen' on the server, not the express app
 */
// should be require("dronestream").listen(server);
require("./index").listen(server2);
server2.listen(3001);
//----------Done with camera stream server







//--------Set up the vars-----
var fs = require('fs');
var express = require('express');
var app = express();

app.use(express.static(__dirname + './public'));
var Controller = require('./custom_modules/Controller');
var Locator = require('./custom_modules/Locator');
var LeapForAuto = require('./LeapForAuto');
var manBuffer = false;
var leaper = new LeapForAuto();
var arDrone = require('ar-drone');
var client = arDrone.createClient();

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

var con = new Controller(client);
var front = false;
var back = false;
var left = false;
var right = false;
var up = false;
var down = false;
var override = false;
var override_buf = false;
var isFlying = false;
//----Done with vars


//-----UI interfaing comands
app.get('/', function(req, res){
	res.sendfile("./public/index.html");
});
app.get('/style.css', function(req, res){
	res.sendfile("./public/style.css");
});
app.get('/WebFunctions.js', function(req, res){
	res.sendfile("./public/WebFunctions.js");
});
app.get('/components/jquery/jquery.js', function(req, res){
	res.sendfile("./components/jquery/jquery.js");
});
app.get('/FINGERS_CROSSED.html', function(req, res){
	console.log("got the file");
	res.sendfile("./FINGERS_CROSSED.html");
});
app.get('/update', function(req, res){
	res.send(con.getData(override||manBuffer));
});
app.get('/lift', function(req, res){
	client.takeoff();
	con.loc.reset();
  isFlying = true;
  //autonomous flying
  client.animateLeds('blinkOrange',2,1000);
	res.send(true);
});
app.get('/land', function(req, res){
    console.log('Land control');
    exiting = true;
    isFlying = false;
    //landing (MOST IMPORTANT!)
    client.animateLeds('blinkGreen',2,1);
    con.kill();
    client.stop();
    client.land();
	  res.send(true);
});
app.get('/act', function(req, res){	//This one activates controlling
	console.log(req.param('act'));
	if(req.param('act')=="front")
	{
		front = true;
		back = false;
	}
	if(req.param('act')=="back")
	{
		back = true;
		front = false;
	}
	if(req.param('act')=="left")
	{
		left = true;
		right = false;
	}
	if(req.param('act')=="right")
	{
		right = true;
		left = false;
	}
	if(req.param('act')=="up")
	{
		up = true;
		down = false;
	}
	if(req.param('act')=="down")
	{
		down = true;
		up = false;
	}
	override = true;
	override_buf = true;
  if (isFlying) {
  	//manual flying
  	client.animateLeds('standard',1,4);
  }
	res.send(true);
});
app.get('/off', function(req, res){	//This handles turning off all commands
	console.log("off");
	//if(req.param('act') == 0)
	//{
		front = false;
		back = false;
		left = false;
		right = false;
		up = false;
		down = false;
	//}
	setTimeout(function(){
		if(override_buf == false)
		{
			override = false;
        if (isFlying) {
          //autonomous flying
          client.animateLeds('blinkOrange',2,1000);
        }
		}
	}, 3000);
	override_buf = false;
	res.send(true);
});

//--------Video stuff
client.disableEmergency();
//VIDEO FEEDS - enable one of the following codecs
//client.config('video:video_codec', '136'); //live stream MPEG4.2 360p, record H.264 360p
//client.config('video:video_codec', '130'); //live stream MPEG4.2 360p, record H.264 720p
//client.config('video:video_codec', '128'); //live stream MPEG4.2 360p
//client.config('video:video_codec', '129'); //live stream H.264 hw encoder 360p
client.config('video:video_codec', '131'); //live stream H.264 hw encoder 720p
//----ENABLE USB RECORDING
client.config('video:video_on_usb', 'TRUE'); //finally, enable USB recording of video stream




// Land on ctrl-c
var exiting = false;
process.on('SIGINT', function() {
    if (exiting) {
        process.exit(0);
    } else {
        console.log('\nGot SIGINT. Landing, press Control-C again to force exit.');
        exiting = true;
        isFlying = false;
        //landing (MOST IMPORTANT!)
        client.animateLeds('blinkGreen',2,1);
        con.kill();
        client.stop();
        client.land();
    }
});

//client.takeoff();
leaper.start();		//Start up leap
client.after(2500, function(){
    var atGoal = setInterval(function(){
        if(leaper.manCtrl() == true && manBuffer == false)	//If almost leap controlled, but not confirmed yet
        {
            console.log('Attempted buffer')		//Attempt to buffer
            var testBuf = setInterval(function() {
                clearInterval(testBuf);
                manBuffer =true;
                if (isFlying) {
                  //manual flying
  				        client.animateLeds('standard',1,4);
                }
            }, 200);
        }
        con.update(manBuffer||override);	//Update the controller to move if not overridden
        									//If manBuffer||override, it is running manual.
        if(override)
        {
        	//-------Control overrides for web UI controls
        	client.stop();
        	//console.log("Overridden: " + "front:"+ front+" back:"+ back+" left:"+ left+" right:"+ right);
        	if(front) client.front(0.3);
        	if(back) client.back(0.3);
        	if(left) client.left(0.3);
        	if(right) client.right(0.3);
        	if(up) client.up(0.2);
        	if(down) client.down(0.2);
        }
        if(manBuffer)	//If controlled manually by the leap
        {
          console.log('manual ctrl');
          var neut = true;
          if(leaper.isLeft())
          {
            client.left(0.4);
            neut = false;
          }
          if(leaper.isRight())
          {
            client.right(0.4);
            neut = false;
          }
          if(leaper.isFront())
          {
            client.front(0.4);
            neut = false;
          }
          if(leaper.isBack())
          {
            client.back(0.4);
            neut = false;
          }
          if(!leaper.manCtrl())		//If leaper is actually not under control anymore
          {
            manBuffer = false;
            if(isFlying) {
              //autonomous flying
  			      client.animateLeds('blinkOrange',2,1000);
            }
          }
          if(neut)		//If no commands are being given to leaper, stabilize
          {
          	con.stable();
          }
          left = leaper.isLeft();
          right = leaper.isRight();
          front = leaper.isFront();
          back = leaper.isBack();
        }
        if(con.shouldKill())	//--------Call to check if anything asked con to die
        {
            console.log('Trykill');
            clearInterval(atGoal);
            //landing (MOST IMPORTANT!)
			      client.animateLeds('blinkGreen',2,1);
            client.stop();
            client.land();
        }
        if(con.within() && leaper.manCtrl() == false)	//------This is somewhat deprecated
        {
            goal1 = true;
            client.stop();
            console.log("Goal reached, awaiting Instruction");
        }
    }, 70); //Refresh Rate
});

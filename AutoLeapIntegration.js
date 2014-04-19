var Controller = require('./custom_modules/Controller');
var Locator = require('./custom_modules/Locator');
//var LeapForAuto = require('./LeapForAuto');
var manBuffer = false;

var arDrone = require('ar-drone');
var client = arDrone.createClient();

client.disableEmergency();
//VIDEO FEEDS - enable one of the following codecs
//client.config('video:video_codec', '136'); //live stream MPEG4.2 360p, record H.264 360p
//client.config('video:video_codec', '130'); //live stream MPEG4.2 360p, record H.264 720p
//client.config('video:video_codec', '128'); //live stream MPEG4.2 360p
//client.config('video:video_codec', '129'); //live stream H.264 hw encoder 360p
client.config('video:video_codec', '131'); //live stream H.264 hw encoder 720p
//----ENABLE USB RECORDING
client.config('video:video_on_usb', 'TRUE'); //finally, enable USB recording of video stream
/*jshint boss: true */

var leap = require('./leap-fly/node_modules/leapjs');
var _ = require('./leap-fly/node_modules/underscore');
var direction = require('./leap-fly/node_modules/curtsy');

var controller;

// calibrate the 1st time there is a hand
var calibration = null;
var flying = true;

var takenOff = true;
var takeControl = false;
var turnLeft = false;
var turnRight = false;
var goUp = false;
var goDown = false;
var goFront = false;
var goBack = false;

function start(frameType) {
  frameType = frameType || 'deviceFrame';
  controller = new leap.Controller({
    frameEventName: frameType,
    enableGestures: true
  });
  controller.on('frame', processFrame);
  controller.connect();
}

function processFrame(frame) {
  if (!frame.valid) return;

  var hand = frame.hands[0]; //one hand
  //var punch = frame.hands[1]; //two hands
  
  //console.log(frame.hands[0]);

  if (frame.hands.length > 0 && !flying && !takenOff) {
    //console.log('OVERRIDE');
    takenOff = true;
    takeControl = true;
    //emitter.emit('takeoff');
    resetCalibration();
  }

  if (frame.hands.length === 0 && flying && takenOff) //if flying and hands are absent
  {
    //emitter.emit('land');
    takeControl = false;
    console.log('Release');
    takenOff = false;
  }





  //if (animate(punch)) return;
  //if (!hand) return hover();
  if (!calibration) return calibrate(frame);

  if (flying === false) return;
  control(hand);
}

function control(hand) {
  frontBack(normalise(hand.palmNormal[2]));
  leftRight(normalise(hand.palmNormal[0]));
  //turn(normaliseCm(hand.palmPosition[0]));
  //upDown(normaliseCm(hand.palmPosition[1]));
}

function calibrate(frame) {
  if (frame.hands.length !== 1) return;
  if (!calibrate._first) return (calibrate._first = frame);
  if ((frame.id - calibrate._first.id) < 150) return;
  var hand = frame.hands[0];
  calibrate._first = null;

  calibration = {
    ver: normaliseCm(hand.palmPosition[1]),
    hor: normaliseCm(hand.palmPosition[0]),

    lat: normalise(hand.palmNormal[0]),
    lon: normalise(hand.palmNormal[2])
  };
  console.log('calibrated!', calibration);
}

function resetCalibration() {
  calibration = null;
  calibrate._first = null;
  //console.log('--- calibration reset');
}


function checkGesture(gesture) {
  return gesture.progress > 1.9;
}

// get only the circle gesture from the gestures array
function getGesture(gestures, type) {
  if (!gestures.length) return;
  var types = _.pluck(gestures, 'type');
  var index = types.indexOf(type);
  if (index > -1) return gestures[index];
}

/*
function hover () {
  //emitter.emit('stop');
  //console.log('HOVER');
  resetCalibration();
}*/

// TODO: frontBack/leftRight can be partially applied into 1 function!
function frontBack(value) {
  var _scale = _.partial(scale, calibration.lon, 80);

  if (isSimilar(value, calibration.lon)) {
    //return emitter.emit('front', 0);
    console.log("StopFront");
    goBack = false;
    goFront = false;
  }
    

  if (value > calibration.lon) {
    console.log('FRONT');
    //return emitter.emit('front', _scale(value));
    goFront = true;
    goBack = false;
  }
  if (value < calibration.lon) {
    console.log('BACK');
    //return emitter.emit('back', _scale(value));
    goBack = true;
    goFront = false;
  }
}

function leftRight(value) { 
  var _scale = _.partial(scale, calibration.lat, 80);

  if (isSimilar(value, calibration.lat)) {
    console.log('LEFT-CAL');
    //return emitter.emit('left', 0);
    turnLeft = false;
    turnRight = false;
  }

  if (value > calibration.lat) {
    console.log('LEFT');
    //return emitter.emit('left', _scale(value));
    turnLeft = true;
    turnRight = false;
  }
  if (value < calibration.lat) {
    console.log('RIGHT');
    //return emitter.emit('right', _scale(value));
    turnLeft = false;
    turnRight = true;
  }
}

function upDown(value) {
  var _scale = _.partial(scale, calibration.ver, 20);

  if (isSimilar(value, calibration.ver, 5)) {
    //console.log('UP-CAL');
    //return emitter.emit('up', 0);
  }

  if (value > calibration.ver) {
    //console.log('UP');
    //return emitter.emit('up', _scale(value, true));
  }
  if (value < calibration.ver) {
    //console.log('DOWN');
    //return emitter.emit('down', _scale(value, true));
  }
}

var con = new Controller(client);

// Land on ctrl-c
var exiting = false;
process.on('SIGINT', function() {
    if (exiting) {
        process.exit(0);
    } else {
        console.log('\nGot SIGINT. Landing, press Control-C again to force exit.');
        exiting = true;
        con.kill();
        client.stop();
        client.land();
    }
});

client.takeoff();
start();
client.after(2500, function(){
    var atGoal = setInterval(function(){
    	if((takeControl == true) && (manBuffer == false))
    	{
            console.log('Attempted buffer')
    		var testBuf = setInterval(function() {
    			clearInterval(testBuf);
    			manBuffer =true;
    		}, 200);
    	}
        con.update(manBuffer);
        if(manBuffer)
        {
            console.log('manual ctrl');
        	if(turnLeft)
        	{
        		client.counterClockwise(0.5);
        	}
        	if(turnRight)
        	{
        		client.clockwise(0.5);
        	}
        	if(goFront)
        	{
        		client.front(0.1);
        	}
        	if(goBack)
        	{
        		client.back(0.1);
        	}
        	if(!takeControl)
        	{
        		manBuffer = false;
        	}
        }
        if(con.shouldKill())
        {
            console.log('Trykill');
            clearInterval(atGoal);
            client.stop();
            client.land();
        }
        if(con.within() && takeControl == false)
        {
            goal1 = true;
            client.stop();
            console.log("Goal reached, awaiting Instruction");
        }
    }, 70); //Refresh Rate
});

// expose methods

function isSimilar(value, compare, tolerance) {
  tolerance = tolerance || 15;
  return (Math.abs(value - compare) <= tolerance);
}

function normaliseCm(value) {
  return parseInt(value / 10, 10);
}

function normalise(value) {
  return parseInt(100 * value, 10);
}

function scale(min, max, value, cap) {
  var v = Math.abs(value - min);
  if (cap && v > max) v = max;
  return v / max;
}
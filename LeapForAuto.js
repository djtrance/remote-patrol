/*jshint boss: true */

var leap = require('./leap-fly/node_modules/leapjs');
var _ = require('./leap-fly/node_modules/underscore');
var direction = require('./leap-fly/node_modules/curtsy');


/*
module.exports.manCtrl = manCtrl;
module.exports.isLeft = isLeft;
module.exports.isRight = isRight;
module.exports.isUp = isUp;
module.exports.isDown = isDown;
module.exports.isFront = isFront;
module.exports.isBack = isBack;
module.exports.start = start;
*/
function LeapForAuto() {
  this.calibration = null;
  this.flying = true;
  this.controller;
  //this.client
  //this.animateProgress;
  this.takenOff = true;
  this.takeControl = false;
  this.turnLeft = false;
  this.turnRight = false;
  this.goUp = false;
  this.goDown = false;
  this.goFront = false;
  this.goBack = false;
}
module.exports = LeapForAuto;

/*var controller, client, animateProgress;*/

// calibrate the 1st time there is a hand
/*
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
*/

// animationTypes
/*
var animations = [
  'flipLeft',
  'flipRight'
];*/

LeapForAuto.prototype.manCtrl = function(){
	return this.takeControl;
}
LeapForAuto.prototype.isLeft = function(){
	return this.turnLeft;
}
LeapForAuto.prototype.isRight = function(){
	return this.turnRight;
}
LeapForAuto.prototype.isUp = function(){
	return this.goUp;
}
LeapForAuto.prototype.isDown = function(){
	return this.goDown;
}
LeapForAuto.prototype.isFront = function(){
	return this.goFront;
}
LeapForAuto.prototype.isBack = function(){
	return this.goBack;
}

LeapForAuto.prototype.start = function(frameType) {
  frameType = frameType || 'deviceFrame';
  this.controller = new leap.Controller({
    frameEventName: frameType,
    enableGestures: true
  });
  this.controller.on('frame', this.processFrame);
  this.controller.connect();
}

LeapForAuto.prototype.processFrame = function(frame) {
  if (!frame.valid) return;

  var hand = frame.hands[0]; //one hand
  //var punch = frame.hands[1]; //two hands
  
  //console.log(frame.hands[0]);

  if (frame.hands.length > 0 && !this.flying && !this.takenOff) {
    //console.log('OVERRIDE');
    this.takenOff = true;
    this.takeControl = true;
    //emitter.emit('takeoff');
    this.resetCalibration();
  }

  if (frame.hands.length === 0 && this.flying && this.takenOff) //if flying and hands are absent
  {
    //emitter.emit('land');
    this.takeControl = false;
    console.log('Release');
    this.takenOff = false;
  }





  //if (animate(punch)) return;
  if (!hand){
    this.manCtrl = false;
    this.takenOff = false;
    return;
  } 
  if (!this.calibration) return this.calibrate(frame);

  if (this.flying === false) return;
  this.control(hand);
}

LeapForAuto.prototype.control = function(hand) {
  this.frontBack(this.normalise(hand.palmNormal[2]));
  this.leftRight(this.normalise(hand.palmNormal[0]));
  //turn(normaliseCm(hand.palmPosition[0]));
  //upDown(normaliseCm(hand.palmPosition[1]));
}

/*
function registerClient(drone) {
  client = drone;
  client.config('general:navdata_demo', 'FALSE');
  client.on('navdata', function (navdata) {
    flying = !!navdata.droneState.flying;
  });
}*/


LeapForAuto.prototype.calibrate = function(frame) {
  if (frame.hands.length !== 1) return;
  if (!this.calibrate._first) return (this.calibrate._first = frame);
  if ((frame.id - calibrate._first.id) < 150) return;
  var hand = frame.hands[0];
  this.calibrate._first = null;

  this.calibration = {
    ver: this.normaliseCm(hand.palmPosition[1]),
    hor: this.normaliseCm(hand.palmPosition[0]),

    lat: this.normalise(hand.palmNormal[0]),
    lon: this.normalise(hand.palmNormal[2])
  };
  console.log('calibrated!', calibration);
}

LeapForAuto.prototype.resetCalibration = function() {
  this.calibration = null;
  this.calibrate._first = null;
  //console.log('--- calibration reset');
}


LeapForAuto.prototype.checkGesture = function(gesture) {
  return gesture.progress > 1.9;
}

// get only the circle gesture from the gestures array
LeapForAuto.prototype.getGesture = function(gestures, type) {
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
LeapForAuto.prototype.frontBack = function(value) {
  var _scale = _.partial(this.scale, this.calibration.lon, 80);

  if (this.isSimilar(value, this.calibration.lon)) {
  	//return emitter.emit('front', 0);
  	console.log("StopFront");
  	this.goBack = false;
  	this.goFront = false;
  }
  	

  if (value > this.calibration.lon) {
    console.log('FRONT');
    //return emitter.emit('front', _scale(value));
    this.goFront = true;
    this.goBack = false;
  }
  if (value < this.calibration.lon) {
    console.log('BACK');
    //return emitter.emit('back', _scale(value));
    this.goBack = true;
    this.goFront = false;
  }
}

function leftRight(value) { 
  var _scale = _.partial(this.scale, this.calibration.lat, 80);

  if (this.isSimilar(value, this.calibration.lat)) {
    console.log('LEFT-CAL');
    //return emitter.emit('left', 0);
    this.turnLeft = false;
    this.turnRight = false;
  }

  if (value > this.calibration.lat) {
    console.log('LEFT');
    //return emitter.emit('left', _scale(value));
    this.turnLeft = true;
    this.turnRight = false;
  }
  if (value < this.calibration.lat) {
    console.log('RIGHT');
    //return emitter.emit('right', _scale(value));
    this.turnLeft = false;
    this.turnRight = true;
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

/*
function turn(value) {
  var _scale = _.partial(scale, calibration.hor, 20);

  if (isSimilar(value, calibration.hor, 5)) return emitter.emit('clockwise', 0);
  if (value > calibration.hor) return emitter.emit('clockwise', _scale(value, true));
  if (value < calibration.hor) return emitter.emit('counterClockwise', _scale(value, true));
}*/

/*
function animate(punch) {
  if (punch && normaliseCm(punch.palmVelocity[2]) < -100 && !animateProgress) {
    animateProgress = true;
    setTimeout(function () { animateProgress = false; }, 500);
    emitter.emit('animate', animations[0], 500);
    return true;
  }
}*/


// expose methods

LeapForAuto.prototype.isSimilar = function(value, compare, tolerance) {
  tolerance = tolerance || 15;
  return (Math.abs(value - compare) <= tolerance);
}

LeapForAuto.prototype.normaliseCm = function(value) {
  return parseInt(value / 10, 10);
}

LeapForAuto.prototype.normalise = function(value) {
  return parseInt(100 * value, 10);
}

LeapForAuto.prototype.scale = function(min, max, value, cap) {
  var v = Math.abs(value - min);
  if (cap && v > max) v = max;
  return v / max;
}
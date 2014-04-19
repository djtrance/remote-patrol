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
  if (!this.calibration) return this.calibrate(frame, this);

  if (this.flying === false) return;
  this.control(hand, this);
}

function control(hand, self) {
  frontBack(normalise(hand.palmNormal[2]),self);
  leftRight(normalise(hand.palmNormal[0]),self);
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


function calibrate(frame, self) {
  if (frame.hands.length !== 1) return;
  if (!self.calibrate._first) return (self.calibrate._first = frame);
  if ((frame.id - self.calibrate._first.id) < 150) return;
  var hand = frame.hands[0];
  self.calibrate._first = null;

  self.calibration = {
    ver: normaliseCm(hand.palmPosition[1]),
    hor: normaliseCm(hand.palmPosition[0]),

    lat: normalise(hand.palmNormal[0]),
    lon: normalise(hand.palmNormal[2])
  };
  console.log('calibrated!', self.calibration);
}

function resetCalibration(self) {
  self.calibration = null;
  self.calibrate._first = null;
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
function frontBack(value, self) {
  var _scale = _.partial(scale, self.calibration.lon, 80);

  if (isSimilar(value, self.calibration.lon)) {
  	//return emitter.emit('front', 0);
  	console.log("StopFront");
  	self.goBack = false;
  	self.goFront = false;
  }
  	

  if (value > self.calibration.lon) {
    console.log('FRONT');
    //return emitter.emit('front', _scale(value));
    self.goFront = true;
    self.goBack = false;
  }
  if (value < self.calibration.lon) {
    console.log('BACK');
    //return emitter.emit('back', _scale(value));
    self.goBack = true;
    self.goFront = false;
  }
}

function leftRight(value, self) { 
  var _scale = _.partial(scale, self.calibration.lat, 80);

  if (isSimilar(value, self.calibration.lat)) {
    console.log('LEFT-CAL');
    //return emitter.emit('left', 0);
    self.turnLeft = false;
    self.turnRight = false;
  }

  if (value > self.calibration.lat) {
    console.log('LEFT');
    //return emitter.emit('left', _scale(value));
    self.turnLeft = true;
    self.turnRight = false;
  }
  if (value < self.calibration.lat) {
    console.log('RIGHT');
    //return emitter.emit('right', _scale(value));
    self.turnLeft = false;
    self.turnRight = true;
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
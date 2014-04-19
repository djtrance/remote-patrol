/*jshint boss: true */

var leap = require('leapjs');
var _ = require('underscore');
var direction = require('curtsy');
var EventEmitter = require('events').EventEmitter;

var emitter = new EventEmitter();
module.exports = emitter;

var controller, client, flying, animateProgress;

// calibrate the 1st time there is a hand
var calibration = null;

var takenOff = false;

// animationTypes
var animations = [
  'flipLeft',
  'flipRight'
];

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
  var punch = frame.hands[1]; //two hands
  
  //console.log(frame.hands[0]);

  //var circleGest = getGesture(frame.gestures, 'circle');
  //if (circleGest && checkGesture(circleGest)) return takeoffOrLand(circleGest);

  if (frame.hands.length > 0 && !flying && !takenOff) {
    console.log('TAKEOFF');
    takenOff = true;
    emitter.emit('takeoff');
    resetCalibration();
  }

  if (frame.hands.length !== 1 && flying && takenOff) //if flying and hands are absent
  {
    emitter.emit('land');
    console.log('LAND');
    takenOff = false;
  }





  if (animate(punch)) return;
  if (!hand) return hover();
  if (!calibration) return calibrate(frame);

  if (flying === false) return;
  control(hand);
}

function control(hand) {
  frontBack(normalise(hand.palmNormal[2]));
  leftRight(normalise(hand.palmNormal[0]));
  turn(normaliseCm(hand.palmPosition[0]));
  upDown(normaliseCm(hand.palmPosition[1]));
}

function registerClient(drone) {
  client = drone;
  client.config('general:navdata_demo', 'FALSE');
  client.on('navdata', function (navdata) {
    flying = !!navdata.droneState.flying;
  });
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

/*function takeoffOrLand(gesture) {
  //var dir = direction(gesture).type;
  if (dir === 'clockwise' && !flying) {
    emitter.emit('takeoff');
    resetCalibration();
  } else if (dir === 'counter-clockwise' && flying) {
    emitter.emit('land');
  }
}*/

function takeoffOrLand(gesture) {
  var dir = direction(gesture).type;
  //if (dir === 'clockwise' && !flying) {
  if (frame.hands.length > 0 && !flying) {
    console.log('TAKEOFF');
    //emitter.emit('takeoff');
    resetCalibration();
  }
  else if (frame.hands.length !== 1 && flying) //if flying and hands are absent
  {
    //emitter.emit('land');
    console.log('LAND');
  }
}


function hover () {
  //emitter.emit('stop');
  //console.log('HOVER');
  resetCalibration();
}

// TODO: frontBack/leftRight can be partially applied into 1 function!
function frontBack(value) {
  var _scale = _.partial(scale, calibration.lon, 80);

  if (isSimilar(value, calibration.lon)) return emitter.emit('front', 0);
  if (value > calibration.lon) {
    console.log('FRONT');
    return emitter.emit('front', _scale(value));
  }
  if (value < calibration.lon) {
    console.log('BACK');
    return emitter.emit('back', _scale(value));
  }
}

function leftRight(value) { 
  var _scale = _.partial(scale, calibration.lat, 80);

  if (isSimilar(value, calibration.lat)) {
    console.log('LEFT-CAL');
    return emitter.emit('left', 0);
  }

  if (value > calibration.lat) {
    console.log('LEFT');
    return emitter.emit('left', _scale(value));
  }
  if (value < calibration.lat) {
    console.log('RIGHT');
    return emitter.emit('right', _scale(value));
  }
}

function upDown(value) {
  var _scale = _.partial(scale, calibration.ver, 20);

  if (isSimilar(value, calibration.ver, 5)) {
    console.log('UP-CAL');
    return emitter.emit('up', 0);
  }

  if (value > calibration.ver) {
    console.log('UP');
    return emitter.emit('up', _scale(value, true));
  }
  if (value < calibration.ver) {
    console.log('DOWN');
    return emitter.emit('down', _scale(value, true));
  }
}

function turn(value) {
  var _scale = _.partial(scale, calibration.hor, 20);

  if (isSimilar(value, calibration.hor, 5)) return emitter.emit('clockwise', 0);
  if (value > calibration.hor) return emitter.emit('clockwise', _scale(value, true));
  if (value < calibration.hor) return emitter.emit('counterClockwise', _scale(value, true));
}

function animate(punch) {
  if (punch && normaliseCm(punch.palmVelocity[2]) < -100 && !animateProgress) {
    animateProgress = true;
    setTimeout(function () { animateProgress = false; }, 500);
    emitter.emit('animate', animations[0], 500);
    return true;
  }
}


// expose methods
emitter._getGesture = getGesture;
emitter.start = start;
emitter.registerClient = registerClient;

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

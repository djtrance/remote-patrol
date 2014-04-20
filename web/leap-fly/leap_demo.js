var arDrone = require('ar-drone');
var log = require('./throttle-log')(500);

var client = arDrone.createClient();


//VIDEO FEEDS - enable one of the following codecs
//client.config('video:video_codec', '136'); //live stream MPEG4.2 360p, record H.264 360p
//client.config('video:video_codec', '130'); //live stream MPEG4.2 360p, record H.264 720p
//client.config('video:video_codec', '128'); //live stream MPEG4.2 360p
//client.config('video:video_codec', '129'); //live stream H.264 hw encoder 360p
client.config('video:video_codec', '131'); //live stream H.264 hw encoder 720p
//----ENABLE USB RECORDING
client.config('video:video_on_usb', 'TRUE'); //finally, enable USB recording of video stream


// make sure the client always calls disableEmergency() before taking off
var takeoff = client.takeoff;
client.takeoff = function (value) {
  this.disableEmergency();
  takeoff.call(this, value);
};


// Land on ctrl-c
var exiting = false;
process.on('SIGINT', function() {
    if (exiting) {
        process.exit(0);
    } else {
        console.log('\nGot SIGINT. Landing, press Control-C again to force exit.');
        exiting = true;
        client.stop();
        client.land();
    }
});


client.config('general:navdata_demo', 'FALSE');

var cmds = [
  'stop'
, 'takeoff'
, 'land'
, 'up'
, 'down'
, 'clockwise'
, 'counterClockwise'
, 'front'
, 'back'
, 'left'
, 'right'
, 'animate'
, 'animateLeds'
];

// basic example. Drone can hook in here (event triggers command)
var controller = require('./remote-new');

  // iterate over all the commands and bind them to the event listeners
cmds.forEach(function (cmd) {
  controller.on(cmd, function (value, duration) {
    log(cmd, value);
    client[cmd](value, duration);
  });
});


client.once('navdata', function (navdata) {
  if (!navdata.droneState.lowBattery) {
    // once everything is ready, start the controller
    console.log('START', navdata.demo && navdata.demo.batteryPercentage, '%');
    controller.registerClient(client);
    controller.start();
  } else {
    console.log('LOW BATTERY', navdata.demo.batteryPercentage, '%');
  }
});

client.on('navdata', function (navdata) {
  if (navdata.droneState.lowBattery) {
    client.land();
  }
});

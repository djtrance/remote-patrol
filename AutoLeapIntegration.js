var Controller = require('./custom_modules/Controller');
var Locator = require('./custom_modules/Locator');
var LeapForAuto = require('./LeapForAuto');
var manBuffer = false;
var leaper = new LeapForAuto();
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
leaper.start();
client.after(2500, function(){
        var atGoal = setInterval(function(){
            if(leaper.manCtrl() == true && manBuffer == false)
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
          if(leaper.isLeft())
          {
            client.left(0.1);
          }
          if(leaper.isRight())
          {
            client.right(0.1);
          }
          if(leaper.isFront())
          {
            client.front(0.1);
          }
          if(leaper.isBack())
          {
            client.back(0.1);
          }
          if(!leaper.manCtrl())
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
        if(con.within() && leaper.manCtrl() == false)
        {
            goal1 = true;
            client.stop();
            console.log("Goal reached, awaiting Instruction");
        }
    }, 70); //Refresh Rate
});
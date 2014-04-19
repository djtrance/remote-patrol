var arDrone = require('ar-drone');
var jsfeat = require('jsfeat');
var camera = require('camera');
var cv = require('opencv');
var client = arDrone.createClient();

var http = require('http');
var vid = new cv.VideoCapture(0);

if(client != null)
{
    client.stop();
    var pngStream = arDrone.createClient().getPngStream();
    require('ar-drone-png-stream')(client, { port: 8000 });

    console.log('Connecting png stream ...');

    var lastPng;
    pngStream
        .on('error', console.log)
        .on('data', function(pngBuffer) {
        lastPng = pngBuffer;
    });

    var server = http.createServer(function(req, res) {
          if (!lastPng) {
                  res.writeHead(503);
                  res.end('Did not receive any png data yet.');
                  return;
        }

            res.writeHead(200, {'Content-Type': 'image/png'});
              res.end(lastPng);
    });

    server.listen(8080, function() {
          console.log('Serving latest png on port 8080 ...');
    });

    if(lastPng)
    {
        var col = lastPng.width;
        var rows = lastPng.height;
        var data_type = jsfeat.F32_t | jsfeat.C3_t;
        var png_buffer = lastPng.data;
        var jsfeat_mat = new jsfeat.matrix_t(col, rows, data_type, png_buffer);
    }

}
else
{
    var vid = new cv.VideoCapture(0);
    var mat;

    var window1 = new cv.NamedWindow("Video Stream reg", 0);
//    var window2 = new cv.NamedWindow("Video Stream face", 0);

    var callback = function(){
        vid.read(function(err, im){
        if(im)
            window1.show(im);


      });
    }
    setTimeout(callback(), 500);
}
// When opening a file, the full path must be passed to opencv
/*
 *
vid.read(function(err, mat){
  var track = new cv.TrackedObject(mat, [420, 110, 490, 170], {channel:         "value"});
  var x = 0;

  var iter = function(){

    vid.read(function(err, m2){
      x++;
      var rec = track.track(m2)
      console.log(">>", x, ":" , rec)
      if (x % 10 == 0){
        m2.rectangle([rec[0], rec[1]], [rec[2], rec[3]])
 //       m2.save('./out-motiontrack-' + x + '.jpg')
      }
      if (x<100)
        iter();
    })
  }
  iter();
})


if(client == NULL)
{
    webcam = camera.createStream();
    var getUserMedia =
                window.navigator.getUserMedia ||
                window.navigator.mozGetUserMedia ||
                window.navigator.webkitGetUserMedia ||
                window.navigator.msGetUserMedia;

    var requestAnimationFrame =
                window.requestAnimationFrame        ||
                window.webkitRequestAnimationFrame  ||
                window.mozRequestAnimationFrame     ||
                window.oRequestAnimationFrame       ||
                window.msRequestAnimationFrame      ||
                function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };

    var cancelAnimationFrame = window.cancelAnimationFrame ||
                                        function(id) {
                                            clearTimeout(id);
                                        };
}
else
{
    var pngStream = client.getPngStream();
}
/*
client.takeoff();

client
  .after(5000, function() {
    this.clockwise(0.5);
  })
  .after(3000, function() {
    this.animate('flipLeft', 15);
  })
  .after(1000, function() {
    this.stop();
    this.land();
  });
*/

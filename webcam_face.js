var arDrone = require('ar-drone');
var jsfeat = require('jsfeat');
var camera = require('camera');
var cv = require('opencv');
var client = arDrone.createClient();

var http = require('http');
//var body_cascade = new cv.CascadeClassifier("./data/haarcascade_upperbody_alt.xml");

var vid = new cv.VideoCapture(0);

var window1 = new cv.NamedWindow("Video Stream reg", 0);
var window3 = new cv.NamedWindow("Video Stream body", 0);

var iter = 0;

var lowThresh = 0;
var highThresh = 100;
var nIters = 2;
var maxArea = 2500;

var GREEN = [0, 255, 0]; //B, G, R
var WHITE = [255, 255, 255]; //B, G, R
var RED = [0, 0, 255]; //B, G, R

var callback = setInterval( function() {
  if (iter<0)
  {
      console.log('Trykill');
      clearInterval(callback);
  }

  vid.read(function(err, im){
      var all = new cv.Matrix(im.height(), im.width());

      body = im.copy();

      body.detectObject(cv.FACE_CASCADE, {}, function(err, bodies){
          for(var i=0; i<bodies.length; i++) { //start face count
            //for(var i=0; i<1; i++) { //start face count
              var b = bodies[i];
              var unique = true;

              //THIS PART
              if(b != null)
              for (var j = i; j < bodies.length; j++)
              {
                  var cb = bodies[j];
                  if(cb != null && (
                         (Math.abs(cb.x - b.x)> (b.width) && Math.abs(cb.y - b.y)> (b.height))
                      || (Math.abs(cb.x - b.x)>(cb.width) && Math.abs(cb.y - b.y)>(cb.height))
                    ) || i == j )
                  {
                      if (unique)
                        body.ellipse(b.x + b.width/2, b.y + b.height/2, b.width/2, b.height/2);
                  }
                  else
                  {
                      bodies[j] = null;
                  }
              }
          }
          window3.show(body);
          //body.save("./out")
      });
      im.convertGrayscale();
      im_canny = im.copy();

      if(im)
          //window1.show(im);
      //console.log(""+iter);
      iter++;

  })
}, 33);

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

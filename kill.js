//AT*REF=1,290717696<CR>AT*REF=2,290717952<CR>AT*REF=3,290717696<CR>
//var arDrone = require('ar-drone');

//var control = arDrone.createUdpControl();



// Run this to make your drone take off for 5 seconds and then land itself
// again.

var UdpControl = require('./node_modules/ar-drone/lib/control/UdpControl');

var control   = new UdpControl();
var fly       = false;
emergency = false;




setInterval(function() {
  control.ref({fly: fly, emergency: emergency});
  control.pcmd();
  control.flush();
  console.log(emergency);
}, 30);

// For the first second, disable emergency if there was one
setTimeout(function() {
  emergency = true;
}, 100);

setTimeout(function() {
  emergency=false;
}, 1000);

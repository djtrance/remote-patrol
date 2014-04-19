var arDrone = require('ar-drone');
var client = arDrone.createClient();

client.takeoff();

// Land on ctrl-c
var exiting = false;
process.on('SIGINT', function() {
    if (exiting) {
        process.exit(0);
    } else {
        console.log('Got SIGINT. Landing, press Control-C again to force exit.');
        exiting = true;
        client.stop();
        client.land();
    }
});

client.on('navdata', console.log);

client
  .after(5000, function() {
    this.clockwise(0.5);
  })
  .after(1000,function() {
    this.stop();
  })
  .after(5000,function() {
    this.front(0.5);
  })
  .after(1000,function() {
    this.stop();
  })
  .after(5000,function() {
    this.back(0.5);
  })
  .after(1000,function() {
    this.stop();
  })
  .after(5000,function() {
    this.left(0.5);
  })
  .after(1000,function() {
    this.stop();
  })
  .after(5000,function() {
    this.right(0.5);
  })
  .after(1000,function() {
    this.stop();
  })
  .after(5000, function() {
    this.counterClockwise(0.5);
  })
  .after(1000, function() {
    this.stop();
    this.land();
  });
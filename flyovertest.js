var arDrone = require('ar-drone');
var client = arDrone.createClient();

var xVel = 0;
var yVel = 0;
var zVel = 0;
var altitude = 0;

client.disableEmergency();
client.config('general:video_enable','TRUE');
client.on('navdata', function(d) {
        /*if (!this._busy && d.demo) {
            this._busy = true;
            self._processNavdata(d);
            self._control(d);
            this._busy = false;
        }*/
        if(d.demo)
        {
        	xVel = d.demo.xVelocity;
        	yVel = d.demo.yVelocity;
        	zVel = d.demo.zVelocity;
        	altitude = d.demo.altitude;
        	console.log("Altitude:" + altitude + " xVel:" + xVel +  " yVel:" + yVel+ " zVel:" + zVel+ "\n");
        }

    });
client.takeoff();

// Land on ctrl-c
var exiting = false;
process.on('SIGINT', function() {
    if (exiting) {
    	//client.enableEmergency();
        process.exit(0);
    } else {
    	client.stop();
    	client.back(.1);
    	client.after(5000, function(){
    		console.log('Got SIGINT. Landing, press Control-C again to force exit.');
        	exiting = true;
        	client.stop();
        	client.land();
    	});

    }
});

var prevalt = altitude;
var over_edge = false;

var edgeint = setInterval(function(){
	if(altitude > prevalt + 2000)
	{
		over_edge = true;
		clearInterval(edgeint);
	}
},300);

client.up(.5);
client.after(2000, function(){
	this.stop();
})
	.after(2000, function(){
	this.front(.3);	
})
	.after(10, function(){
	var forint = setInterval(function(){
		if(over_edge)
		{
			clearInterval(forint);
			client.stop();
			client.back(.2).after(1000, function() {
				client.stop();
				client.land();
			});
		}
	})
});

//client.on('navdata', console.log);

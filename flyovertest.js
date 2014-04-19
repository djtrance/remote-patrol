var arDrone = require('ar-drone');
var client = arDrone.createClient();

client.config('general:video_enable','TRUE');
client.reset();
client.takeoff();

// Land on ctrl-c
var exiting = false;
process.on('SIGINT', function() {
    if (exiting) {
    	//client.enableEmergency();
        process.exit(0);
    } else {
    	client.stop();
    	client.back(1);
    	client.after(1000, function(){
    		console.log('Got SIGINT. Landing, press Control-C again to force exit.');
        	exiting = true;
        	client.stop();
        	client.land();
    	});

    }
});
client.up(1);
client.after(1000, function(){
	this.stop();
});

console.log(client.navdata.demo.altitude + "\n");

var prevalt = client.navdata.demo.altitude;
var over_edge = false;

var edgeint = setInterval(function(){
	if(client.navdata.demo.altitude > prevalt + 2000)
	{
		over_edge = true;
		clearInterval(edgeint);
	}
},300);

client.forward(.5);
client.after(10, function(){
	var forint = setInterval(function(){
		if(over_edge)
		{
			client.stop();
			client.back(1);
			client.after(1000, function() {
				client.stop();
				client.land();
				clearInterval(forint);
			});
		}
	})
});

//client.on('navdata', console.log);

require('./custom_modules/Controller');
require('./custom_modules/Locator');

var arDrone = require('ar-drone');
var client = arDrone.createClient();


client.disableEmergency();
client.config('general:video_enable','TRUE');

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

var con = new Controller(client);

client.takeoff();

con.front(1, .3);
con.left(2, .3);

var atGoal = setInterval(function(){
	con.update();
	if(con.within())
	{
		clearInterval(atGoal);
		client.stop();
		client.land();
	}	
}, 30);
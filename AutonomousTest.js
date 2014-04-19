var Controller = require('./custom_modules/Controller');
var Locator = require('./custom_modules/Locator');

var arDrone = require('ar-drone');
var client = arDrone.createClient();


client.disableEmergency();

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


var goal1 = false;

client.takeoff();
client.after(2500, function() {
    //client.calibrate(0);
    })
    .after(0, function(){
    con.front(10, .1);
    con.left(10, .1);
    var atGoal = setInterval(function(){
        con.update(false);
        if(con.shouldKill())
        {
            console.log('Trykill');
            clearInterval(atGoal);
            client.stop();
            client.land();
        }
        if(con.within() && !goal1)
        {
            goal1 = true;
            client.stop();
            con.back(1, .1);
            con.right(2, .1);
            console.log("Goal 1 reached, starting second trip");
        }
        else if(con.within() && goal1)
        {
            console.log("Goal 2 reached, landing");
            clearInterval(atGoal);
            client.stop();
            client.land();
        }
    }, 70);
});
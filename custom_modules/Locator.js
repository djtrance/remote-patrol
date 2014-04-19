function Locator (client) {
	this.client = client;
	this.xVel = 0;
	this.yVel = 0;
	this.altitude = 0;
	this.x = 0;
	this.y = 0;
	client.on('navdata', function(d) {
        if(d.demo)
        {
        	this.xVel = d.demo.xVelocity;
        	this.yVel = d.demo.yVelocity;
        	altitude = d.demo.altitude;
        	console.log("Altitude:" + altitude + " xVel:" + xVel +  " yVel:" + yVel+ " zVel:" + zVel+ "\n");
        }

    });
}

Locator.prototype.updatePos = function() {
	this.x += this.xvel/1000;
	this.y += this.yvel/1000;
}
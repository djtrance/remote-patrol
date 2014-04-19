module.exports = Locator;
function Locator (client) {
	this.client = client;
	this.xVel = 0;
	this.yVel = 0;
	this.altitude = 0;
	this.xLoc = 0;
	this.yLoc = 0;
	this.mag = 0;
	client.on('navdata', function(d) {
        if(d.demo)
        {
        	this.xVel = d.demo.xVelocity;
        	this.yVel = d.demo.yVelocity;
        	this.altitude = d.demo.altitude;
        	//this.mag = d.magneto.heading.fusionUnwrapped.toRad()
        	console.log("Altitude:" + this.altitude + " x:" + this.xLoc +  " y:" + this.yLoc);
        }

    });
}

Locator.prototype.updatePos = function() {
	this.xLoc += this.xvel/1000;
	this.yLoc += this.yvel/1000;
}
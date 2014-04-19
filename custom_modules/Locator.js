module.exports = Locator;
function Locator (client) {
	var self = this;
	this.client = client;
	this.xVel = 0;
	this.yVel = 0;
	this.altitude = 0;
	this.xLoc = 0;
	this.yLoc = 0;
	this.mag = 0;
	this.client.on('navdata', function(d) {
        if(d.demo)
        {
        	self.processData(d);
        }
    });
}

Locator.prototype.updatePos = function() {
	this.xLoc += (this.xVel * Math.cos(this.mag) - this.yVel * Math.sin(this.mag));
	this.yLoc += (this.xVel * Math.cos(this.mag) - this.yVel * Math.sin(this.mag));
}

Locator.prototype.processData = function(d) {
    this.xVel = d.demo.xVelocity/1000;
    this.yVel = d.demo.yVelocity/1000;
    this.altitude = d.demo.altitude;
    console.log("Altitude:" + this.altitude + " xV:" + this.xVel +  " yV:" + this.yVel);
    console.log("xLoc:" + this.xLoc +  " yLoc:" + this.yLoc);
    if(d.magneto)
    {
    	this.mag = d.magneto.heading.fusionUnwrapped.toRad();
    }
    console.log("Mag: " + this.mag);
}
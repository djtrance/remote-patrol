var Locator = require('./Locator');

module.exports = Controller;
function Controller (client) {
	this.loc = new Locator(client);
	this.client = client;
	this.xGoal = 0;
	this.yGoal = 0;
	this.xSpeed = 0;
	this.ySpeed = 0;
	this.tol = 3;
	this.radtol = 0.1;
	this.shouldDie = false;
}

Controller.prototype.update = function(manual) {
	this.loc.updatePos();
	console.log("Curr Angle:" + this.loc.mag + " Correct Angle:" + this.getCorrAng());
	if(!manual)
	{
		if(!this.within())
		{
			if(!this.angGood())
			{
				this.client.front(0);
				var ang = this.getCorrAng();
				if(ang > 1.57 && this.mag < -1.57)
				{
					this.client.counterClockwise(0.5);
				}
				else if(ang < -1.57 && this.mag > 1.57)
				{
					this.client.clockwise(0.5);
				}
				else if(this.mag > ang)
				{
					this.client.counterClockwise(0.5);
				}
				else
				{
					this.client.clockwise(0.5);
				}
			}
			else {
				this.client.clockwise(0);
				this.client.front(0.1);
			}
		}
	}
	/*
	if(!this.xGood)
	{
		if(this.loc.xLoc < this.xGoal) {
			this.client.front(xSpeed);
		}
		else {
			this.client.back(xSpeed);
		}
	}
	else {
		this.client.front(0);
	}
	if(!this.yGood)
	{
		if(this.loc.yLoc < this.yGoal) {
			this.client.right(ySpeed);
		}
		else {
			this.client.left(ySpeed);
		}
	}
	else {
		this.client.left(0);
	}*/
}

Controller.prototype.getCorrAng = function() {
	console.log((this.yGoal - this.loc.yLoc) + " " + (this.xGoal - this.loc.xLoc));
	return Math.atan2((this.yGoal - this.loc.yLoc), (this.xGoal - this.loc.xLoc));
}

Controller.prototype.angGood = function() {
	var currAng = this.loc.mag;
	var corrAng = this.getCorrAng();
	return (currAng - this.radtol < corrAng && currAng + this.radtol > corrAng);
}

Controller.prototype.xGood = function () {
	return (this.loc.xLoc - this.tol < this.xGoal && this.loc.xLoc + this.tol > this.xGoal);
}

Controller.prototype.yGood = function () {
	return (this.loc.yLoc - this.tol < this.yGoal && this.loc.yLoc + this.tol > this.yGoal);
}

Controller.prototype.within = function() {
	return (this.xGood() && this.yGood());
}

Controller.prototype.front = function(dist, speed) {
	//this.client.front(speed);
	this.xGoal += dist;
	this.xSpeed = speed;
}

Controller.prototype.back = function(dist, speed) {
	//this.client.back(speed);
	this.xGoal -= dist;
	this.xSpeed = speed;
}

Controller.prototype.left = function(dist, speed) {
	//this.client.left(speed);
	this.yGoal -= dist;
	this.ySpeed = speed;
}

Controller.prototype.right = function(dist, speed) {
	//this.client.back(speed);
	this.yGoal += dist;
	this.ySpeed = speed;
}

Controller.prototype.goHome = function() {
	this.yGoal = 0;
	this.xGoal = 0;
}

Controller.prototype.kill = function() {
	this.shouldDie = true;
	console.log('Kill call called');
}

Controller.prototype.shouldKill = function() {
	return this.shouldDie;
}
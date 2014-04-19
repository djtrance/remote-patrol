var Locator = require('./Locator');

module.exports = Controller;
function Controller (client) {
	this.loc = new Locator(client);
	this.client = client;
	this.xGoal = 0;
	this.yGoal = 0;
	this.xSpeed = 0;
	this.ySpeed = 0;
	this.tol = .01;
	this.die = false;
}

Controller.prototype.update = function() {
	this.loc.updatePos();
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
	}
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
	return this.die;
}
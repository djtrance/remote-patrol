require('./Locator');

function Controller (client) {
	this.loc = new Locator(client);
	this.client = locator.client;
	this.xGoal = 0;
	this.yGoal = 0;
	this.xSpeed = 0;
	this.ySpeed = 0;
	this.tol = .5;
}

Controller.prototype.update = function() {
	this.loc.updatePos();
	if(!this.xGood)
	{
		if(loc.x < loc.xGoal) {
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
		if(loc.y < loc.yGoal) {
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
	return (loc.x - this.tol < this.xGoal && loc.x + this.tol > this.xGoal);
}

Controller.prototype.yGood = function () {
	return (loc.y - this.tol < this.yGoal && loc.y + this.tol > this.yGoal);
}

Controller.prototype.within = function() {
	return (this.xGood() && this.yGood());
}

Controller.prototype.front = function(dist, speed) {
	this.client.front(speed);
	this.xGoal += dist;
	this.xSpeed = speed;
}

Controller.prototype.back = function(dist, speed) {
	this.client.back(speed);
	this.xGoal -= dist;
	this.xSpeed = speed;
}

Controller.prototype.left = function(dist, speed) {
	this.client.left(speed);
	this.yGoal -= dist;
	this.ySpeed = speed;
}

Controller.prototype.right = function(dist, speed) {
	this.client.back(speed);
	this.yGoal += dist;
	this.ySpeed = speed;
}
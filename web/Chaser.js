var Controller = require('./custom_modules/Controller');
var Locator = require('./custom_modules/Locator');
var arDrone = require('ar-drone');
var client = arDrone.createClient();
var con = new Controller(client);
var startx = 0;
var starty = 0;

var currEntry = 0;
var rawArray = new Array();
var DestinationArray = new Array();
var max follow points = 12;

function aveArray(valArray) {
	var xSum = 0;
	var ySum = 0;
	for(int i = 0; i < 15; i++)
	{
		xSum += valArray[i][0];
		ySum += valArray[i][1];
	}
	var xAve = xSum/15;
	var yAve = ySum/15;
	
}

function newValue(valArray, value) {

}
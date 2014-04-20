var net = require('net');
var fs = require('fs');
var jParser = require('jParser');
var jdataview = require('jDataView'); 
var syncState = false;
var lidar_buffer  = Buffer(0); 
var buffer_pos = 0;

var cnt = 0; 

var client = net.connect(12002,'172.24.0.50', function () {
	syncState = false;
	lidar_buffer = Buffer(0); 
	buffer_pos = 0; 
});

var objectPosX;
var objectPosY;


client.on('data', function (data) {
	lidar_buffer = Buffer.concat([lidar_buffer, data]); 

	while ((lidar_buffer.length - buffer_pos) >= 4)  {
		if (lidar_buffer.readUInt32BE(buffer_pos) == 0xAFFEC0C2) {
			if (syncState) {
				var header_view = new jDataView(lidar_buffer, 0, buffer_pos, false); 
				var header_parser = new jParser(header_view, {
				    header: {
						prevMsgSize: 'uint32',
						msgSize: 'uint32',
						reserved: 'uint8',
						deviceID: 'uint8',
						dataType: 'uint16',
						timestamp: ['array', 'uint32',2 ],
						msgData: ['array', 'uint8', function() { return this.current.msgSize; }], 
				    }
				});

				var msg_header = header_parser.parse('header');
				if (msg_header.dataType == 0x2221) {

					var object_parser = new jParser(msg_header.msgData, {
						point2d: {
						  posX: 'int16',
						  posY: 'int16'
						},
						size2d: {
						  sizeX: 'uint16', 
						  sizeY: 'uint16'
						},
						object: {
							objectID: 'uint16',
							objectAge: 'uint16',
							objectPredictedAge: 'uint16', 
							relativeTimestamp: 'uint16', 
							referencePoint: 'point2d', 
							referencePointSigma: 'point2d', 
							closestPoint: 'point2d', 
							boundingBoxCntr: 'point2d', 
							boundingBoxSize: 'size2d', 
							objectBoxCntr: 'point2d', 
							objectBoxSize: 'size2d' ,
							objectBoxOrientation: 'int16',   
							absVelo: 'point2d',
							absVeloSigma: 'size2d',
							relVelo: 'point2d',
							classification: 'uint16', 
							classificationAge: 'uint16', 
							classificationCert: 'uint16', 
							numContours: 'uint16',
							contourPoints: ['array', 'point2d', function() { return this.current.numContours;} ]
						},

						objectList: {
							headerTimestamp: ['array', 'uint32',2 ], 
							numberOfObjects: 'uint16', 
							objects: ['array', 'object', function() { return this.current.numberOfObjects; }]
						}
					});
					cnt = cnt + 1;
					//console.log(cnt); 
					//console.log(object_parser.parse('objectList')); 
					var parseStructure = object_parser.parse('objectList')
					//console.log(JSON.stringify(parseStructure, null,'\t'));
					for (i=0; i < parseStructure.objects.length; i++) {
						if ((( parseStructure.objects[i].relVelo.posX * parseStructure.objects[i].relVelo.posX
							 + parseStructure.objects[i].relVelo.posY * parseStructure.objects[i].relVelo.posY) > 57500) 
						  &&  (parseStructure.objects[i].classification == 3 || parseStructure.objects[i].classification == 2)
							) {
							//console.log(parseStructure.objects[i].objectID);
							objectPosX = parseStructure.objects[0].boundingBoxCntr.posX;
							objectPosY = parseStructure.objects[0].boundingBoxCntr.posY;
							//console.log("x: " + parseStructure.objects[0].boundingBoxCntr.posX);
							//console.log("y: " + parseStructure.objects[0].boundingBoxCntr.posY);
						}
					}
				} 
			} 
			syncState = true; 
			lidar_buffer = lidar_buffer.slice(buffer_pos + 4); 
			buffer_pos = 0; 
		} else {
			buffer_pos = buffer_pos + 1; 
		}
	}
});





var Controller = require('./custom_modules/Controller');
var Locator = require('./custom_modules/Locator');
var arDrone = require('ar-drone');
var client = arDrone.createClient();
var con = new Controller(client);

var currEntry = 0;
var rawElem = 0;
var rawSize = 1;
var valArray = new Array();
valArray = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
var rawArray = new Array();
rawArray = [[0,0]];
var DestinationArray = new Array();
var currDestPoint = 0;
var currFolPoint = 0;
var maxFollowPoints = 12;
var started = false;

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

function aveArray() {
	var xSum = 0;
	var ySum = 0;
	var j = 1;
	for(var i = 0; i < 15; i++)
	{
		if(valArray[i])
		{
			xSum += valArray[i][0];
			ySum += valArray[i][1];
			j++;
		}
	}
	var xAve = xSum/j;
	var yAve = ySum/j;
	return [xAve, yAve];
}

function newValue(value) {
	valArray[currEntry] = value;
	currEntry++;
	if(currEntry == 15)
	{
		currEntry -= 15;
	}
}

function addValue() {
	var value = rawArray[rawElem];
	rawElem++;
	newValue(value);
	if (currEntry == 0)
	{
		if(currFolPoint<maxFollowPoints)
		{
			var ave = aveArray(valArray);
			DestinationArray[currFolPoint] = ave;
		}
	}
}

var lidarHandler = setInterval(function(){
	if(!((objectPosX == rawArray[rawSize-1][0])&&(objectPosY == rawArray[rawSize-1][1])))
	{
		rawArray[rawSize] = [objectPosX, objectPosY];
		rawSize++;
	}
}, 45);

function start() {
	rawElem = rawSize-30;
	var valArrayHandler = setInterval(function(){
		if(rawElem<rawSize)
		{
			addValue();
		}
	},50);
	var tripHandler = setInterval(function(){
		if(!started && currFolPoint>2)
		{
			client.takeoff();
			started = true;
			con.loc.xLox = DestinationArray[0][0];
			con.loc.yLoc = DestinationArray[0][1];
			con.xGoal = DestinationArray[1][0];
			con.yGoal = DestinationArray[1][1];
		} else if(started) {
			con.update(false);
			if(con.within() && currDestPoint<maxFollowPoints)
			{
				currDestPoint++;
				con.xGoal = DestinationArray[currDestPoint][0];
				con.yGoal = DestinationArray[currDestPoint][1];
			} else if(con.within())
			{
				client.stop();
				client.land();
			}
		}
	});
}

var inited = false;
process.on('SIGQUIT', function() {
	console.log("tries");
	if(!inited)
	{
		inited = true;
		start();
	}
});




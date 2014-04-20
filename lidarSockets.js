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
							+ parseStructure.objects[i].relVelo.posY * parseStructure.objects[i].relVelo.posY) > 57500) && 
							(parseStructure.objects[i].classification == 3 || parseStructure.objects[i].classification == 2)
							) {
							//console.log(parseStructure.objects[i].objectID);
							objectPosX = parseStructure.objects[0].boundingBoxCntr.posX;
							objectPosY = parseStructure.objects[0].boundingBoxCntr.posX;
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



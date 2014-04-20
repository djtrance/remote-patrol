var fs = require('fs');
var jParser = require('jParser');
var jDataView = require('jDataView'); 

var magicNum = 0; 

fs.readFile('lidar', function (err, data) {
  var header_view = new jDataView(data, undefined, undefined, false); 
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
    
  var magic = [0, 0, 0, 0]; 
  do {
    magic[3] = magic[2]; 
    magic[2] = magic[1]; 
    magic[1] = magic[0]; 
    magic[0] = header_parser.parse('uint8');  
  } while ((magic[3] != 0xAF) || (magic[2] !=0xFE) || (magic[1] != 0xC0) || (magic[0] != 0xC2)); 

  var msg_header = header_parser.parse('header');
  while (msg_header.dataType != 0x2221) {
    header_parser.skip(4); 
    msg_header = header_parser.parse('header');
  }

  var object_parser = new jParser(msg_header.msgData, {
    point2d: {
      posX: 'uint16',
      posY: 'uint16'
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

  console.log(object_parser.parse('objectList')); 
});




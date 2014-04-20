var front = false;
var back = false;
var left = false;
var right = false;
var up = false;
var down = false;

setInterval(function(){
	$.get(
    "update",
    function(data) {
    	$("#droneControl").html(data[0]);
    	$("#batteryPercentage").html(Math.round(data[1], 4));
    	$("#clockwiseDegrees").html(Math.round(data[2], 4));
    	$("#frontBackDegrees").html(Math.round(data[3], 4));
    	$("#leftRightDegrees").html(Math.round(data[4], 4));
    	$("#altitude").html(Math.round(data[5], 4));
    	$("#xVelocity").html(Math.round(data[6], 4));
    	$("#yVelocity").html(Math.round(data[7], 4));
    	$("#zVelocity").html(Math.round(data[8], 4));
      $("#xLoc").html(Math.round(data[9], 4));
      $("#yLoc").html(Math.round(data[10], 4));
      $("#xGoal").html(Math.round(data[11], 4));
      $("#yGoal").html(Math.round(data[12], 4));
      if(data[13]) {
        $("#up-button").addClass('pressed');
      } else {
        $("#up-button").removeClass('pressed');
      }
      if(data[14]) {
        $("#down-button").addClass('pressed');
      } else {
        $("#down-button").removeClass('pressed');
      }
      if(data[15]) {
        $("#left-button").addClass('pressed');
      } else {
        $("#left-button").removeClass('pressed');
      }
      if(data[16]) {
        $("#right-button").addClass('pressed');
      } else {
        $("#right-button").removeClass('pressed');
      }
      if(data[17]) {
        $("#go-up-button").addClass('pressed');
      } else {
        $("#go-up-button").removeClass('pressed');
      }
      if(data[18]) {
        $("#go-down-button").addClass('pressed');
      } else {
        $("#go-down-button").removeClass('pressed');
      }
    });
}, 100);

$("html").mouseup(function() {
  $.get(
    "off",
    {act: 0},
    function(data) {
       	//alert(data);
    });
});

$("#up-button").mousedown(function() {
  $.get(
    "act",
    {act: "front"},
    function(data) {
       	//alert(data);
    });
});

$("#down-button").mousedown(function() {
  $.get(
    "act",
    {act: "back"},
    function(data) {
       	//alert(data);
    });
});

$("#left-button").mousedown(function() {
  $.get(
    "act",
    {act: "left"},
    function(data) {
       	//alert(data);
    });
});

$("#right-button").mousedown(function() {
  $.get(
    "act",
    {act: "right"},
    function(data) {
       	//alert(data);
    });
});

$("#go-up-button").mousedown(function() {
  $.get(
    "act",
    {act: "up"},
    function(data) {
       	//alert(data);
    });
});

$("#go-down-button").mousedown(function() {
  $.get(
    "act",
    {act: "down"},
    function(data) {
       	//alert(data);
    });
});

$("#land").mousedown(function(){
    $.get(
    "land",
    function(data) {
        //alert(data);
    });
})

$("#lift").mousedown(function(){
    $.get(
    "lift",
    function(data) {
        //alert(data);
    });
})

$('html').keydown(function(event){ w=87 a=65 d=68 s=83 q=81 ' '=32
  if(event.which == 87)
  {
    front = true;
    back = false;
    $.get(
    "act",
    {act: "front"},
    function(data) {
        //alert(data);
    });
    $.get(
    "off",
    {act: "back"},
    function(data) {
        //alert(data);
    });
  } else if(event.which == 65) {
    left = true;
    right = false;
    $.get(
    "act",
    {act: "left"},
    function(data) {
        //alert(data);
    });
    $.get(
    "off",
    {act: "right"},
    function(data) {
        //alert(data);
    });
  } else if(event.which == 68) {
    right = true;
    left = false;
    $.get(
    "act",
    {act: "right"},
    function(data) {
        //alert(data);
    });
    $.get(
    "off",
    {act: "left"},
    function(data) {
        //alert(data);
    });
  } else if(event.which == 83) {
    back = true;
    front = false;
    $.get(
    "act",
    {act: "back"},
    function(data) {
        //alert(data);
    });
    $.get(
    "off",
    {act: "front"},
    function(data) {
        //alert(data);
    });
  } else if(event.which == 81) {
    $.get(
    "land",
    function(data) {
        //alert(data);
    });
  } else if(event.which == 32) {
    $.get(
    "lift",
    function(data) {
        //alert(data);
    });
  }
})

$('html').keyup(function(event){ w=87 a=65 d=68 s=83 q=81 ' '=32
  if(event.which == 87)
  {
    front = false;
    $.get(
    "off",
    {act: "front"},
    function(data) {
        //alert(data);
    });
  } else if(event.which == 65) {
    left = false;
    $.get(
    "off",
    {act: "left"},
    function(data) {
        //alert(data);
    });
  } else if(event.which == 68) {
    right = false;
    $.get(
    "off",
    {act: "right"},
    function(data) {
        //alert(data);
    });
  } else if(event.which == 83) {
    back = false;
    $.get(
    "off",
    {act: "back"},
    function(data) {
        //alert(data);
    });
  } 
})  

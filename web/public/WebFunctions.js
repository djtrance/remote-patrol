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
    });
}, 100);

$("html").mouseup(function() {
  $.get(
    "off",
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

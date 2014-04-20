var express = require('express');
var http = require('http');
var routes = require('./routes');
var app2 = express();
var path = require('path');
  //var server = require('http');
//server.createServer(app);




var server2 = http.createServer(app);

//app.set('view engine', 'ejs');


//app.configure(function () {
    app2.set('views', __dirname + '/views');
    app2.set('view engine', 'jade', { pretty: true });
    app2.use(express.favicon());
    //app.use(express.logger('dev'));
    app2.use(app2.router);
    app2.use(express.static(path.join(__dirname, 'public')));
//});
/*
app.configure('development', function () {
    app.use(express.errorHandler());
    app.locals.pretty = true;
});*/

app2.get('/', routes.index);

/*
 * Important:
 *
 * pass in the server object to listen, not the express app
 * call 'listen' on the server, not the express app
 */
// should be require("dronestream").listen(server);
require("./index").listen(server2);
server2.listen(3001);



/**
 * Module dependencies.
 * 
 * @modifier Jaehee Ha
 * lovesm135@kaist.ac.kr
 * added https
 * 2016.11.11
 */

var express = require('express')
  , routes = require('./routes')
  , auth = require('./auth')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , fs = require('fs');

var assert = require('assert');

var app = express();

var options = {
		ca: fs.readFileSync('./root.crt'),
		key: fs.readFileSync('./key.key'),
		cert: fs.readFileSync('./2_winsgkwogml.iptime.org.crt')
};

var	passport = require('passport');

var config = require('./conf.json');

// all environments
app.set('port', process.env.PORT || config.PORT);
app.set('port2', '443');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: auth.randomString() }));
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}


//Initialize the auth layer
auth.configure('/login', '/logout', app);

routes.configure(app);

var httpServer = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var httpsServer = https.createServer(options, app).listen(app.get('port2'), function(){
	console.log('HTTPS server listening on port ' + app.get('port2'));
})

var io = require('socket.io').listen(httpServer);

/*io.sockets.on('connection',function(socket){
   socket.emit('toclient',{msg:'Welcome !'});
   socket.on('fromclient',function(data){
       socket.broadcast.emit('toclient',data);
       socket.emit('toclient',data);
       console.log('Message from client :'+data.msg);
   })
});*/


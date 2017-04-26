'use-strict';


var express         = require('express');
var session         = require('express-session');
var expressValidator = require('express-validator');
var flash           = require('express-flash');
var favicon         = require('serve-favicon');
var path            = require('path');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var mongoose        = require('mongoose');
var passport        = require('passport');
var fs              = require('fs');
var sassMiddleware  = require('node-sass-middleware');
var MongoStore      = require('connect-mongo');
var debug           = require('debug')('express-starter-app');
var methodOverride  = require('method-override');

//Load ENV vars from .env
if ((process.env.NODE_ENV || 'development') === 'development') {
	require('dotenv').config();
}

var config = require('./config/config'),
    chalk = require('chalk')

// Bootstrap db connection
var db = mongoose.connect(config.db.uri, config.db.options, function (err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});
mongoose.connection.on('error', function (err) {
	console.error(chalk.red('MongoDB connection error: ' + err));
	process.exit(-1);
});

// Globbing model files
config.getGlobbedFiles('./models/**/*.js').forEach(function(modelPath) {
	require(path.resolve(modelPath));
});

require('./config/passport')();

var app = express();

// set up debugging
app.locals.pretty = true;
app.locals.compileDebug=true;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

// use passport session
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

app.use(bodyParser.json());
app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

// Express MongoDB session storage

app.use(session({
	secret: config.sessionSecret,
	cookie: config.sessionCookie,
	name: config.sessionName
}));

app.use(flash());

// Dynamically include routes (via controllers)
fs.readdirSync('./controllers').forEach(function (file) {
  if (file.substr(-3) === '.js') {
    var route = require('./controllers/' + file);
    route.controller(app);
  }
});


// Body parsing middleware supporting
// JSON, urlencoded, and multipart requests.
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Easy form validation!
// This line must be immediately after bodyParser!
app.use(expressValidator());

// If you want to simulate DELETE and PUT
// in your app you need methodOverride.
app.use(methodOverride());



app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.locals.title  = 'Express Starter App';
app.locals.moment = require('moment');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error/500');
});

module.exports = app;

// Logging initialization
console.log('--');
console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
console.log(chalk.green('Port:\t\t\t\t' + config.port));
console.log(chalk.green('Database:\t\t\t' + config.db.uri));
console.log('--');


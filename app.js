'use-strict';


var express         = require('express');
var expressLayouts  = require('express-ejs-layouts');
var flash           = require('connect-flash');
var session         = require('express-session');
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

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// set up debugging
app.locals.pretty = true;
app.locals.compileDebug=true;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);

app.set('layout', 'layouts/default');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express MongoDB session storage

app.use(session({
	secret: config.sessionSecret,
	cookie: config.sessionCookie,
	name: config.sessionName
}));

app.use(flash());
app.use(function(req, res, next){
    res.locals.success = req.flash('success');
    res.locals.errors = req.flash('error');
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// use passport session
app.use(passport.initialize());
app.use(passport.session());

app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

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
  res.render('error');
});

module.exports = app;

// Logging initialization
console.log('--');
console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
console.log(chalk.green('Port:\t\t\t\t' + config.port));
console.log(chalk.green('Database:\t\t\t' + config.db.uri));
console.log('--');


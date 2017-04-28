'use-strict';

var cookieParser    = require('cookie-parser');
var csrf            = require('csurf');
var express         = require('express');
var session         = require('express-session');
var expressValidator = require('express-validator');
var flash           = require('express-flash');
var favicon         = require('serve-favicon');
var path            = require('path');
var bodyParser      = require('body-parser');
var morgan          = require('morgan');
var mongoose        = require('mongoose');
var passport        = require('passport');
var fs              = require('fs');
var methodOverride  = require('method-override');
var helmet          = require('helmet');

//Load ENV vars from .env
if ((process.env.NODE_ENV || 'development') === 'development') {
	require('dotenv').config();
}

var utils = require('./config/utils'),
    chalk = require('chalk'),
    config = require('./config/config');

// Bootstrap db connection
mongoose.connect(config.db.uri);
var db = mongoose.connection;

// Globbing model files
utils.getGlobbedFiles('./models/**/*.js').forEach(function(modelPath) {
	require(path.resolve(modelPath));
});

require('./config/passport')();

var app = express();

//Load ENV vars from .env
if ((process.env.NODE_ENV || 'development') === 'development') {
  app.use(morgan('dev'));
  // Turn off caching in development
  // This sets the Cache-Control HTTP header to no-store, no-cache,
  // which tells browsers not to cache anything.
  app.use(helmet.noCache());
  // Jade options: Don't minify html, debug intrumentation
  app.locals.pretty=true;
  app.locals.compileDebug=true;

}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.set('etag', true);

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));


app.use(expressValidator());
// If you want to simulate DELETE and PUT
// in your app you need methodOverride.
app.use(methodOverride());

var hour = 3600000;
app.use(session(
  config.session
));

// use passport session
app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());

// Security Settings
app.disable('x-powered-by');          // Don't advertise our server type
app.use(csrf({cookie: true}));                      // Prevent Cross-Site Request Forgery
app.use(helmet());                    // frameguard, hide powered by, ienoopen, nosniff, xssfilter

app.use(bodyParser.json());

// Keep user, csrf token
app.use(function (req, res, next) {
  res.locals.user = req.user;
  res.locals._csrf = req.csrfToken();
  next();
});


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



app.locals.application  = config.app.title;
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


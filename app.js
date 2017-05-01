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
var errorHandler    = require('errorhandler');
var debug           = require('debug')('http');

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


/**
 * Error Handling
 */

// If nothing responded above we will assume a 404
// (since no routes responded or static assets found)

// Tests:
//   $ curl http://localhost:3000/notfound
//   $ curl http://localhost:3000/notfound -H "Accept: application/json"
//   $ curl http://localhost:3000/notfound -H "Accept: text/plain"

// Handle 404 Errors
app.use(function (req, res, next) {
  res.status(404);
  debug('404 Warning. URL: ' + req.url);

  // Respond with html page
  if (req.accepts('html')) {
    res.render('error/404', { url: req.url });
    return;
  }

  // Respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found!' });
    return;
  }

  // Default to plain-text. send()
  res.type('txt').send('Error: Not found!');
});

// True error-handling middleware requires an arity of 4,
// aka the signature (err, req, res, next).

// Handle 403 Errors
app.use(function (err, req, res, next) {
  if (err.status === 403) {
    res.status(err.status);
    debug('403 Not Allowed. URL: ' + req.url + ' Err: ' + err);

    // Respond with HTML
    if (req.accepts('html')) {
      res.render('error/403', {
        error: err,
        url: req.url
      });
      return;
    }

    // Respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Not Allowed!' });
      return;
    }

    // Default to plain-text. send()
    res.type('txt').send('Error: Not Allowed!');

  } else {
    // Since the error is not a 403 pass it along
    return next(err);
  }
});

// Production 500 error handler (no stacktraces leaked to public!)
if (app.get('env') === 'production') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    debug('Error: ' + (err.status || 500).toString().red.bold + ' ' + err);
    res.render('error/500', {
      error: {}  // don't leak information
    });
  });
}

// Development 500 error handler
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    debug('Error: ' + (err.status || 500).toString().red.bold + ' ' + err);
    res.render('error/500', {
      error: err
    });
  });
  // Final error catch-all just in case...
  app.use(errorHandler());
}

module.exports = app;

// Logging initialization
console.log('--');
console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
console.log(chalk.green('Port:\t\t\t\t' + config.port));
console.log(chalk.green('Database:\t\t\t' + config.db.uri));
console.log('--');


'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    _ = require('lodash'),
	User = require('mongoose').model('User'),
	path = require('path'),
	config = require('./config'),
  utils = require('./utils');;


// Serialize sessions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

/**
 * Module init function.
 */
module.exports = function() {

	// Initialize strategies
	utils.getGlobbedFiles('./config/strategies/**/*.js').forEach(function(strategy) {
		require(path.resolve(strategy))();
	});
};

/**
 * Login Required middleware.
 */

module.exports.isAuthenticated = function (req, res, next) {
  // Is the user authenticated?
  if (req.isAuthenticated()) {
    // Does the user have enhanced security enabled?
    if (req.user.enhancedSecurity.enabled) {
      // If we already have validated the second factor it's
      // a noop, otherwise redirect to capture the OTP.
      if (req.session.passport.secondFactor === 'validated') {
        return next();
      } else {
        // Verify their OTP code
        res.redirect('/verify-setup');
      }
    } else {
      // If enhanced security is disabled just continue.
      return next();
    }
  } else {
    req.session.attemptedURL = req.url;  // Save URL so we can redirect to it after authentication
    res.set('X-Auth-Required', 'true');
    req.flash('error', { msg: 'You must be logged in to reach that page.' });
    res.redirect('/login');
  }
};

/**
 * Authorization Required middleware.
 */

module.exports.isAuthorized = function (req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];
  if (_.find(req.user.tokens, { kind: provider })) {
    // we found the provider so just continue
    next();
  }
};

/**
 * Check if the account is an Administrator
 */

module.exports.isAdministrator = function (req, res, next) {
  // make sure we are logged in first
  if (req.isAuthenticated()) {
    // user must be be an administrator
    if (req.user.type !== 'admin') {
      req.flash('error', { msg: 'You must be an Administrator reach that page.' });
      return res.redirect('/api');
    } else {
      return next();
    }
  } else {
    req.flash('error', { msg: 'You must be logged in to reach that page.' });
    res.redirect('/login');
  }
};





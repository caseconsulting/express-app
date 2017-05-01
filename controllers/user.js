'use strict';

var User          = require('../models/user');
var debug         = require('debug')('http');
var async         = require('async');
var crypto        = require('crypto');
var config        = require('../config/config');
var passport      = require('passport');
var LoginAttempt  = require('../models/loginAttempt');

/**
 * User Controller
 */

module.exports.controller = function (app) {

  /**
   * GET /login
   * Render login page
   */

  app.get('/login', function (req, res) {
    // Check if user is already logged in
    if (req.user) {
      req.flash('info', { msg: 'You are already logged in!' });
      return res.redirect('/dashboard');
    }
    // Turn off login form if too many attempts
    var tooManyAttempts = req.session.tooManyAttempts || false;
    req.session.tooManyAttempts = null;
    // Render Login form
    res.render('account/login', {
      tooManyAttempts: tooManyAttempts,
      url: req.url
    });
  });

  /**
   * POST /login
   * Log the user in
   */

  app.post('/login', function (req, res, next) {

    // Begin a workflow
    var workflow = new (require('events').EventEmitter)();

    /**
     * Step 1: Validate the data
     */

    workflow.on('validate', function () {

      // Validate the form fields
      req.assert('email', 'Your email cannot be empty.').notEmpty();
      req.assert('email', 'Your email is not valid').isEmail();
      req.assert('password', 'Your password cannot be blank').notEmpty();
      req.assert('password', 'Your password must be at least 4 characters long.').len(4);

      var errors = req.validationErrors();

      if (errors) {
        req.flash('error', errors);
        return res.redirect('/login');
      }

      // next step
      workflow.emit('abuseFilter');
    });

    /**
     * Step 2: Prevent brute force login hacking
     */

    workflow.on('abuseFilter', function () {

      var getIpCount = function (done) {
        var conditions = { ip: req.ip };
        LoginAttempt.count(conditions, function (err, count) {
          if (err) {
            return done(err);
          }
          done(null, count);
        });
      };

      var getIpUserCount = function (done) {
        var conditions = { ip: req.ip, user: req.body.email.toLowerCase() };
        LoginAttempt.count(conditions, function (err, count) {
          if (err) {
            return done(err);
          }
          done(null, count);
        });
      };

      var asyncFinally = function (err, results) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (results.ip >= 3 || results.ipUser >= 6) {
          req.flash('error', { msg: 'You\'ve reached the maximum number of login attempts. Please try again later or reset your password.' });
          req.session.tooManyAttempts = true;
          return res.redirect('/login');
        }
        else {
          workflow.emit('authenticate');
        }

      };

      async.parallel({ ip: getIpCount, ipUser: getIpUserCount }, asyncFinally);
    });

    /**
     * Step 3: Authenticate the user
     */

    workflow.on('authenticate', function () {

      // Authenticate the user
      passport.authenticate('local', function (err, user, info) {
        if (err) {
          req.flash('error', { msg: err.message });
          return res.redirect('back');
        }

        if (!user) {

          // Update abuse count
          var fieldsToSet = { ip: req.ip, user: req.body.email };
          LoginAttempt.create(fieldsToSet, function (err, doc) {
            if (err) {
              req.flash('error', { msg: err.message });
              return res.redirect('back');
            } else {
              // User Not Found (Return)
              req.flash('error', { msg: info.message });
              return res.redirect('/login');
            }
          });

        } else {

          // update the user's record with login timestamp
          user.activity.last_logon = Date.now();
          user.save(function (err) {
            if (err) {
              req.flash('error', { msg: err.message });
              return res.redirect('back');
            }
          });

          // Log user in
          req.logIn(user, function (err) {
            if (err) {
              req.flash('error', { msg: err.message });
              return res.redirect('back');
            }

            // Send user on their merry way
            if (req.session.attemptedURL) {
              var redirectURL = req.session.attemptedURL;
              delete req.session.attemptedURL;
              res.redirect(redirectURL);
            } else {
              res.redirect('/dashboard');
            }

          });

        }

      })(req, res, next);

    });

    /**
     * Initiate the workflow
     */

    workflow.emit('validate');

  });

  /**
   * GET /logout
   * Log the user out
   */

  app.get('/logout', function (req, res) {
    // Augment Logout to handle enhanced security
    req.logout();
    res.redirect('/');
  });

  /**
   * GET /signup
   * Render signup page
   */

  app.get('/signup', function (req, res) {
    if (req.user) {
      return res.redirect('/');
    }
    res.render('account/signup', {
      url: req.url
    });
  });

  /**
   * POST /signup
   * Process a *regular* signup
   */

  app.post('/signup', function (req, res, next) {

    // create user
    var user = new User({
      'profile.name':   req.body.name.trim(),
        email:          req.body.email.toLowerCase(),
        password:       req.body.password,
    });

    // save user
    user.save(function (err) {
      if (err) {
        if (err.code === 11000) {
          req.flash('error', { msg: 'An account with that email address already exists!' });
          req.flash('info', { msg: 'You should sign in with that account.' });
        }else{
          req.flash('error', { msg: err.message });
        }
        return res.redirect('back');
      } else {
        req.logIn(user, function (err) {
          if (err) {
            req.flash('error', { msg: err.message });
            return res.redirect('back');
          }
          // send the right welcome message
          req.flash('info', { msg: 'Thanks for signing up!' });
          return res.redirect('/dashboard');
        });
      }
    });

  });

};

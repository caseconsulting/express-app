'use strict';

/**
 * Module Dependences
 */

var _             = require('lodash');
var User          = require('../models/user');
var debug         = require('debug')('http');       // https://github.com/visionmedia/debug
var utils         = require('../config/utils');
var config        = require('../config/config');
var passport      = require('passport');
var passportConf  = require('../config/passport');


/**
 * Account Controller
 */

module.exports.controller = function (app) {

  /**
   * GET /account*
   * *ALL* acount routes must be authenticated first
   */

  app.all('/account*', passportConf.isAuthenticated);

  /**
   * GET /account
   * Render User Profile Page
   */

  app.get('/account', function (req, res) {
    res.render('account/profile', {
      url: req.url
    });
  });

  /**
   * POST /account
   * Update User Profile Information
   */

  app.post('/account/profile', function (req, res, next) {

    User.findById(req.user.id, function (err, user) {
      if (err) {
        req.flash('error', { msg: err });
        return res.redirect('/account');
      }

      user.email = req.body.email.toLowerCase() || '';
      user.profile.name = req.body.name.trim() || '';
      user.profile.gender = req.body.gender || '';
      user.profile.location = req.body.location.trim() || '';
      user.profile.phone.mobile = req.body.phoneMobile.trim() || '';
      user.profile.website = req.body.website.trim() || '';
      user.activity.last_updated = Date.now();

      user.save(function (err) {
        if (err) {
          req.flash('error', { msg: err });
          return res.redirect('/account');
        }

        req.flash('success', { msg: 'Your Profile has been updated!' });
        res.redirect('/account');
      });
    });

  });

  /**
   * POST /account/password
   * Update User Password
   */

  app.post('/account/password', function (req, res, next) {


    User.findById(req.user.id, function (err, user) {
      if (err) {
        return next(err);
      }

      user.password = req.body.password;
      user.activity.last_updated = Date.now();

      user.save(function (err) {
        if (err) {
          req.flash('error', { msg: err });
          return res.redirect('/account');
        }

        // Send user on their merry way
        req.flash('success', { msg: 'Your password was changed!' });
        res.redirect('/account');

      });
    });

  });

  /**
   * POST /account/delete
   * Delete User Account
   */

  app.post('/account/delete', function (req, res, next) {
    User.remove({ _id: req.user.id }, function (err) {
      if (err) {
        req.flash('error', { msg: err });
        return res.redirect('/account');
      }
      req.logout();
      res.redirect('/');
    });
  });

};

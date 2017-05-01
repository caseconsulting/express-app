'use strict';

/**
 * Module Dependencies
 */

var config        = require('../config/config');
var _             = require('lodash');
var async         = require('async');
var debug         = require('debug')('http');       // https://github.com/visionmedia/debug
var request       = require('request');         // https://github.com/mikeal/request
var passport      = require('passport');
var querystring   = require('querystring');
var passportConf  = require('../config/passport');

/**
 * Dasboard Controller
 */

module.exports.controller = function (app) {

  /**
   * GET /dashboard*
   * *ALL* api routes must be authenticated first
   */

  app.all('/dashboard*', passportConf.isAuthenticated);

  /**
   * GET /dashboard
   * List of API examples.
   */

  app.get('/dashboard', function (req, res) {
    res.render('dashboard/index', {
      url: req.url
    });
  });

};

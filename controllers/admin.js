'use strict';

/**
 * Module Dependencies
 */

var User          = require('../models/user');
var passportConf  = require('../config/passport');

/**
 * Admin Pages Controller
 */

module.exports.controller = function (app) {

  /**
   * GET /accounts
   * Render accounts page
   */

  app.get('/accounts', passportConf.isAuthenticated, passportConf.isAdministrator, function (req, res) {
    res.render('admin/accounts', {
      url: '/administration', // to set navbar active state
      token: res.locals.token
    });
  });

  /**
   * GET /accountlist
   * JSON accounts api
   */

  app.get('/accountlist', passportConf.isAuthenticated, passportConf.isAdministrator, function (req, res) {
    User.find({}, function (err, items) {
      if (err) {
        return (err, null);
      }
      res.json(items);
    });
  });

  /**
   * DEL /accountlist/:id
   * JSON accounts delete api
   */

  app.delete('/accountlist/:id', passportConf.isAuthenticated, passportConf.isAdministrator, function (req, res) {
    User.remove({ _id : req.params.id }, function (err, result) {
      res.send((result === 1) ? { msg: '' } : { msg: 'error: ' + err });
    });
  });

};

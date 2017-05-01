'use strict';
/*global describe*/
/*global it*/

/**
 * Module Dependencies
 */

var request = require('supertest');
var app = require('../app.js');

// Set enviroment
process.env.NODE_ENV = 'test';

/**
 * Test Basic Pages
 */

describe('GET /', function () {
  it('should return 200 OK', function (done) {
    request(app)
      .get('/')
      .expect(200, done);
  });
});

describe('GET /login', function () {
  it('should return 200 OK', function (done) {
    request(app)
      .get('/login')
      .expect(200, done);
  });
});

describe('GET /signup', function () {
  it('should return 200 OK', function (done) {
    request(app)
      .get('/signup')
      .expect(200, done);
  });
});


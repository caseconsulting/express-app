'use strict';

const _ = require('lodash');
/**
 * Load app configurations
 */
var exports = _.extend(
    require('./env/all'),
    require('./env/' + process.env.NODE_ENV) || {}
    );

module.exports = exports;

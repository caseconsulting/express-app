#!/usr/bin/env node

process.env.NODE_ENV='production'

var config = require('../config/config'),
    envfile = require('envfile'),
    chalk = require('chalk');

require('../config/passport')

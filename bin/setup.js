#!/usr/bin/env node

process.env.NODE_ENV='production'

var config = require('../config/config'),
    mongoose = require('mongoose'),
    envfile = require('envfile'),
    fs = require('fs-extra'),
    chalk = require('chalk');

require('../config/passport')

console.log(process.env)

// Bootstrap db connection
var db = mongoose.connect(config.db.uri, config.db.options, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});
mongoose.connection.on('error', function(err) {
	console.error(chalk.red('MongoDB connection error: ' + err));
	process.exit(-1);
});

process.exit(1)


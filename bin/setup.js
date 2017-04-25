#!/usr/bin/env node

'use strict';

process.env.NODE_ENV='production';

var config = require('../config/config'),
    mongoose = require('mongoose'),
    inquirer = require('inquirer'),
    envfile = require('envfile'),
    fs = require('fs-extra'),
    chalk = require('chalk');

require('../app');

require('../config/passport');

var User = mongoose.model('User');
require('../models/user.js');

var questions = [
	{
		type: 'confirm',
		name: 'shouldContinue',
		message: 'Do you wish to configure your deployment now?'
	},
	{
		type: 'input',
		name: 'PORT',
		message: 'What port should this app run on?',
		default: '3000'
	},
	{
		type: 'input',
		name: 'NODE_ENV',
		message: 'What environment is this app running in?',
		default: 'development'
	},
	{
		type: 'input',
		name: 'email',
		message: 'What should be the email for your admin account?'
	},
	{
		type: 'input',
		name: 'username',
		message: 'What should be the username for your admin account?'
	},
	{
		type: 'password',
		name: 'password',
		message: 'What should be the password for your admin account?'
	}
];

if(!fs.existsSync('./\.env')) {
	console.log(chalk.green('\n\nWelcome to the Express Starter App'));

	console.log(chalk.green('You should only run this the first time you run Express Starter App\n--------------------------------------------------\n\n'));

	inquirer.prompt([questions[0]]).then(function (confirmAns) {
     console.log(confirmAns);
		if (confirmAns['shouldContinue']) {

			inquirer.prompt(questions.slice(1)).then(function (answers) {
				answers['NODE_ENV'] = 'production';

				var email = answers['email'];
				var username = answers['username'];
				var pass = answers['password'];
				delete answers['email'];
				delete answers['password'];

				envfile.stringify(answers, function (err, str) {
					fs.outputFile('./\.env', str, function (fileErr) {
						if (fileErr) {
							return console.error(chalk.red(fileErr));
						}
						console.log(chalk.green('Successfully created .env file'));
					});
					var user = new User({
						firstName: 'Admin',
						lastName: 'Account',
						email: email,
						username: username,
						password: pass,
						provider: 'local',
						roles: ['admin', 'user']
					});

					user.save(function (userSaveErr) {
						if (err) {
							return console.error(chalk.red(userSaveErr));
						}

						console.log(chalk.green('Successfully created user'));

						console.log(chalk.green('Express Starter App is configured!'));
						process.exit(1);
					});
				});
			});
		} else {
			console.log(chalk.green('Express Starter App is configured!'));
		}
	});
} else {
	console.log(chalk.red('You already have a .env file'));
	process.exit(1);
}


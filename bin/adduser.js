#!/usr/bin/env node

'use strict';

process.env.NODE_ENV='production';

var mongoose = require('mongoose'),
    inquirer = require('inquirer'),
    path     = require('path'),
    config  = require('../config/config'),
    chalk = require('chalk');

require('../app');
//require('../config/passport');

var User = mongoose.model('User');

var questions = [
{
  type: 'confirm',
    name: 'shouldContinue',
    message: 'Would you like to add a user?'
},
{
  type: 'input',
  name: 'email',
  message: 'What should be the email for your admin account?'
},
{
  type: 'input',
  name: 'name',
  message: 'What is your name for for your admin account?'
},
{
  type: 'password',
  name: 'password',
  message: 'What should be the password for your admin account?'
}
];

console.log(chalk.green('\n\nWelcome to the Express Starter App'));
console.log(chalk.green('You should only run this the first time you run Express Starter App\n--------------------------------------------------\n\n'));

inquirer.prompt([questions[0]]).then(function (confirmAns) {

  if (confirmAns['shouldContinue']) {

    inquirer.prompt(questions.slice(1)).then(function (answers) {

      var email = answers['email'];
      var name = answers['name'];
      var password = answers['password'];

      var user = new User({
        email:email,
          password: password,
          type: 'admin',
          profile: {
            name: name
          }
      });

      var promise = user.save(function (user, err) {
        console.log(user);
        if (err) {
          console.error(chalk.red(err));
          process.exit(0);
        }

        console.log(chalk.green('Successfully created user'));

        process.exit(1);
      });
    });
  }else{
    process.exit(1);
  }
});


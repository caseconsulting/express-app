'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('mongoose').model('User');

module.exports = function () {
	// Use local strategy
// Use the LocalStrategy within Passport.
//   Strategies in passport accept credentials (in this case, a username and password),
//   and invoke a callback with a user object.

passport.use(new LocalStrategy({ usernameField: 'email' }, function (email, password, done) {
  User.findOne({ email: email }, function (err, user) {
    if (!user) {
      return done(null, false, { message: 'Invalid email or password.' });
    }

    // Only authenticate if the user is verified
    if (user.verified) {
      user.comparePassword(password, function (err, isMatch) {
        if (isMatch) {

          // update the user's record with login timestamp
          user.activity.last_logon = Date.now();
          user.save(function (err) {
            if (err) {
              return (err);
            }
          });

          return done(null, user);
        } else {
          return done(null, false, { message: 'Invalid email or password.' });
        }
      });
    } else {
      return done(null, false, { message: 'Your account must be verified first!' });
    }
  });
}));

};


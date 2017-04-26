var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(res);
  res.render('index');
});

router.post('/login', passport.authenticate('local', {
                                   successRedirect: '/',
                                   failureRedirect: '/',
                                   failureFlash: true,
                                   title: 'Express Starter App'
                                    })
);

module.exports = router;

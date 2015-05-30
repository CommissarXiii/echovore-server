var express = require('express');
var router = express.Router();
var models = require('../../models');
var Promise = require('bluebird');

router.post('/', function(req, res, next) {

  req.checkBody('username', 'Valid username is required. Usernames may contain letters, numbers, and the special characters @._- and must be between 3 and 16 characters in length.').notEmpty().matches(/^[a-z0-9_\-@\.]{3,16}$/);
  req.checkBody('password', 'Valid password is required. Password must contain at least one uppercase letter, one lowercase letter, one number, one special character (!@#$&*), and have a minimum length of 8 characters.').matches(/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/);

  // validation errors
  var errors = req.validationErrors();

  if(errors) {

    errors = errors.map(function(error) {
      return {
        detail: error.msg,
        source: {
          parameter: error.param
        }
      }
    })

    return res.status(400).json({
      errors: errors
    });
  }

  models.User.find({
    where: {
      username: req.body.username
    }
  })
  .then(function(user) {

    if(user) {
      throw new Error('User already exists');
    }

    return models.sequelize.transaction(function(t) {

      return models.User.create({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
      }, {transaction: t})
      .then(function(user) {

        return models.UserToken.create({}, {transaction: t})
        .then(function(token) {
          return token.setUser(user, {transaction: t});
        });
      });
    });
  })
  .then(function() {

    res.status(201).send('ok')
  })
  .catch(function(err) {

    res.status(400).json({
      errors: [
        {
          details: err.message
        }
      ]
    });
  });
});

module.exports = router;

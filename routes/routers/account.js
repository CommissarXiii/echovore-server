var express = require('express');
var router = express.Router();
var models = require('../../models');
var Promise = require('bluebird');
var config = require('../../config/config.json');
var jwt = require('jsonwebtoken');

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

router.get('/verify', function(req, res, next) {

  req.checkQuery('token', 'Token is required').notEmpty();
  req.checkQuery('email', 'Email is required').notEmpty();

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

  models.UserToken.find({
    where: {
      hash: req.query.token
    },
    include: [
      {model: models.User, where: {email: req.query.email}}
    ]
  })
  .then(function(userToken) {

    if(!userToken) {

      throw new Error('Invalid token');
    }

    return models.sequelize.transaction(function(t) {

      return userToken.User.updateAttributes({
        active: true
      }, {transaction: t})
      .then(function() {

        return userToken.destroy({transaction: t});
      });
    });
  })
  .then(function() {

    res.status(200).send('ok')
  })
  .catch(function(err) {

    res.status(400).json({
      errors: [
        {
          details: err.message
        }
      ]
    });
  })
})

router.post('/login', function(req, res, next) {

  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();

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
    });

    return res.status(400).json({
      errors: errors
    });
  }

  models.User.find({
    where: {
      username: req.body.username,
      active: true
    }
  })
  .then(function(user) {

    if(!user) {
      throw new Error('Invalid authentication');
    }

    return user.validatePassword(req.body.password)
    .then(function(success) {

      if(!success) {

        throw new Error('Invalid authentication');
      }

      var token = jwt.sign(user, config.key, {
        expiresInMinutes: 1440
      });

      res.status(200).json({
        token: token
      })
    })
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

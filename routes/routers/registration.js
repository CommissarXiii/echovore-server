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

  function findRegistration(username) {

    return models.Registration.find({
      where: {
        username: username
      }
    })
  }

  function findUser(username) {

    return models.User.find({
      where: {
        username: username
      }
    })
  }

  Promise.join(findRegistration(req.body.username), findUser(req.body.username),
  function(registration, user) {

    if(registration || user) {
      throw new Error('Username is already in use');
    }

    return models.Registration.create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    });
  })
  .then(function(registration) {

    // TODO send registration email
    res.status(201).send('ok');
  })
  .catch(function(err) {

    res.status(400).json({
      errors: [{
        detail: err.message
      }]
    });
  });
})

module.exports = router;

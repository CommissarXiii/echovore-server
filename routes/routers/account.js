var express = require('express');
var router = express.Router();

router.get('/new', function(req, res, next) {

  res.render('account/new', {
    title: 'Register new account'
  });
});

router.post('/', function(req, res, next) {


  res.send(req.body.user)
})

module.exports = router;

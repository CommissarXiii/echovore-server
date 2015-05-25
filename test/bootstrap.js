var models = require('../models');

before(function(done) {

  models.sequelize.sync({force: true})
  .then(function() {

    done();
  })

});

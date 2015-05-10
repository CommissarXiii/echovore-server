var app = require('../app');
var request = require('supertest');

describe('Accounts', function(){

  describe('GET /account/new', function() {

    it('should respond with html', function(done) {

      request(app)
        .get('/account/new')
        .expect(200)
        .end(done)
    })
  })
});

var app = require('../../app');
var request = require('supertest');
var models = require('../../models');
var async = require('async');
var expect = require('chai').expect;

describe('Registration', function(){

  before(function(done) {
    
    models.Registration.destroy({truncate: true})
    .then(function() {
      done();
    });

  });

  describe('POST /registration', function() {

    var registration = {};
    var agent = request(app);

    beforeEach(function() {

      registration = {
        username: 'valid_-.@',
        password: 'T3stT3st!',
        email: 'valid@email.com'
      }
    });

    it('should validate params', function(done) {

      registration.username = 'a!';
      registration.password = 'nogood';
      registration.email = 'invalidemail';

      agent.post('/registration').send(registration).expect(400).end(done);
    });

    it('should create a new registration', function(done) {

      agent.post('/registration').send(registration).expect(201).end(function(res) {

        models.Registration.find({
          where: {
            username: registration.username
          }
        })
        .then(function(registration) {

          expect(registration).to.exist;
          done();
        })
        .catch(function(err) {

          throw err;
        });
      });
    });

    it('should not allow duplicate registrations', function(done) {
      
      agent.post('/registration').send(registration).expect(400).end(done);
    });

  });
});

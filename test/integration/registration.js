var app = require('../../app');
var request = require('supertest');
var models = require('../../models');
var async = require('async');
var expect = require('chai').expect;

describe('Registration', function(){

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

    it('should validate inputs', function(done) {

      registration.username = 'a!';
      registration.password = 'nogood';
      registration.email = 'invalidemail';

      agent.post('/registration').send(registration).expect(400).end(done);
    });

    it('should create a new user', function(done) {

      agent.post('/registration').send(registration).expect(201).end(function(res) {

        models.User.find({
          where: {
            username: registration.username
          }
        })
        .then(function(user) {

          expect(user).to.exist;
          done();
        });
      });
    });

    it('should not allow duplicate registrations', function(done) {

      agent.post('/registration').send(registration).expect(400).end(done);
    });

  });
});

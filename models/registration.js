var moment = require('moment');
var Promise = require('bluebird');
var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {

  // utility methods
  function generateExpirationDate() {

    var expiration = moment().add('1', 'day').toDate();

    return Promise.resolve(expiration);
  }

  function generateToken() {

    return new Promise(function(resolve, reject){

      crypto.randomBytes(48, function(ex, buff){

        if(ex) {
          return reject(ex);
        }

        resolve(buff.toString('hex'));
      });
    });
  }

  function hashPassword(password) {

    return sequelize.models.User.hashPassword(password);
  }

  var Registration = sequelize.define('Registration', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    token: DataTypes.STRING,
    expires_at: DataTypes.DATE
  },
  {
    hooks: {
      beforeCreate: function(registration) {

        return new Promise(function(resolve, reject) {

          Promise.join(generateToken(), generateExpirationDate(), hashPassword(registration.password),
            function(token, expiration, password) {

              registration.password = password;
              registration.token = token;
              registration.expires_at = expiration;

              resolve(registration);
            });
        });
      }
    },
    tableName: 'registration',
    freezeTableName: true,
    underscored: true
  });

  return Registration;
}
var Promise = require('bluebird');
var bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {

  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    tableName: 'user',
    freezeTableName: true,
    underscored: true,
    hooks: {
      beforeCreate: function(user) {

        return User.hashPassword(user.password)
        .then(function(hash) {
          user.password = hash;
          return Promise.resolve(user);
        });
      },
      beforeUpdate: function(user) {

        if(user.previous('password') === user.password) {

          return Promise.resolve(user);
        }

        return User.hashPassword(user.password)
        .then(function(hash) {
          user.password = hash;
          return Promise.resolve(user);
        });
      }
    },
    classMethods: {
      hashPassword: function(password) {

        return new Promise(function(resolve, reject) {

          bcrypt.genSalt(10, function(err, salt){

            if(err) {
              return reject(err);
            }

            bcrypt.hash(password, salt, function(err, hash) {

              if(err) {
                return reject(err);
              }

              return resolve(hash);
            });
          });
        });
      }
    },
    instanceMethods: {
      validatePassword: function(password) {

        var self = this;

        return new Promise(function(resolve, reject) {

          bcrypt.compare(password, self.password, function(err, result) {

            if(err) {
              return reject(err);
            }

            return resolve(result);
          })
        });
      }
    }
  });

  return User;
}

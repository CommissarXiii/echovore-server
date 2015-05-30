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
    hooks: {
      beforeCreate: function(user) {

        return User.hashPassword(user.password)
        .then(function(hash) {
          user.password = hash;
          return Promise.resolve(user);
        });
      },
      beforeUpdate: function(user) {

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
    tableName: 'user',
    freezeTableName: true,
    underscored: true
  });

  return User;
}

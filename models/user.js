var bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {

  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING
  },
  {
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
    freezeTableNames: true,
    underscored: true
  })

  return User;
}
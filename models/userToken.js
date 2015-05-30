var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {

  var UserToken = sequelize.define('UserToken', {
    hash: DataTypes.STRING,
    expires_at: DataTypes.DATE
  },
  {
    tableName: 'user_token',
    freezeTableName: true,
    underscored: true,
    hooks: {
      beforeCreate: function(userToken) {

        return UserToken.generateHash()
        .then(function(hash) {
          userToken.hash = hash;
          return Promise.resolve(userToken);
        });
      }
    },
    classMethods: {
      associate: function(models) {
        UserToken.belongsTo(models.User);
      },
      generateHash: function() {

        return new Promise(function(resolve, reject) {

          crypto.randomBytes(48, function(ex, buff) {

            if(ex) {
              return reject(ex);
            }

            resolve(buff.toString('hex'));
          });
        });
      }
    }
  });

  return UserToken;
}

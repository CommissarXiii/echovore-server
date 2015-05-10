module.exports = function(app) {

  app.use('/account', require('./routers/account'))
}

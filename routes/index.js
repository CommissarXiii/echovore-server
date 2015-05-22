module.exports = function(app) {

  app.use('/registration', require('./routers/registration'))
}

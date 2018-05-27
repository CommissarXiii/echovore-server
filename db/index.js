const config = require('../config');
const mongoose = require('mongoose');

mongoose.connect(`mongodb://${config.db.host}/${config.db.name}`);
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

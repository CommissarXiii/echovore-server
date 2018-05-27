require('dotenv').config({ path: './.env' });

module.exports = {
  env: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
  },
};

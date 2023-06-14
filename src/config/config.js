// Config
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  MAX_ROUNDS: process.env.MAX_ROUNDS,
  TESTING: process.env.TESTING,
  REDIS_HOST: process.env.REDIS_HOST
};

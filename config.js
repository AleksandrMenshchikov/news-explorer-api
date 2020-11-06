require('dotenv').config();

const {
  JWT_SECRET = 'dev-secret',
  DB_CONN = 'mongodb://localhost:27017/newsdb',
} = process.env;

module.exports = {
  JWT_SECRET,
  DB_CONN,
};

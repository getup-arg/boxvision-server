const mysql = require("mysql");

const pool = mysql.createPool({
  host: process.env.DB_TABLETS_HOST,
  port: process.env.DB_TABLETS_PORT || 3306,
  user: process.env.DB_TABLETS_USER,
  password: process.env.DB_TABLETS_PASSWORD,
  database: process.env.DB_TABLETS_NAME,
  connectionLimit: 10,
});

module.exports = pool;

const mysql = require("mysql");

const pool = mysql.createPool({
  host: process.env.DB_TOTEM_HOST,
  port: process.env.DB_TOTEM_PORT || 3306,
  user: process.env.DB_TOTEM_USER,
  password: process.env.DB_TOTEM_PASSWORD,
  database: process.env.DB_TOTEM_NAME,
  connectionLimit: 10,
});

module.exports = pool;

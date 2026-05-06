const mysql = require("mysql2");

const socket = process.env.DB_TOTEM_SOCKET;
const host = process.env.DB_TOTEM_HOST;

console.log("[db-totem] socket:", socket || "(not set)");
console.log("[db-totem] host:", host || "(not set)");

const connConfig = socket
  ? { socketPath: socket }
  : { host, port: process.env.DB_TOTEM_PORT || 3306 };

const pool = mysql.createPool({
  ...connConfig,
  user: process.env.DB_TOTEM_USER,
  password: process.env.DB_TOTEM_PASSWORD,
  database: process.env.DB_TOTEM_NAME,
  connectionLimit: 10,
});

module.exports = pool;

//db.js
const mysql = require("mysql2/promise");

const mysqlPool = mysql.createPool({
  host: "localhost",
  user: "crud",
  password: "123456",
  database: "library_db",
});

module.exports = mysqlPool;

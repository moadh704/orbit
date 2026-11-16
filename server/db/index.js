require('dotenv').config();

const useMysql = Boolean(process.env.MYSQLHOST || process.env.DB_HOST);

if (useMysql) {
  const mysql = require('mysql2');
  const pool = mysql.createPool({
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  });
  const promisePool = pool.promise();
  promisePool.dialect = 'mysql';
  module.exports = promisePool;
} else {
  const { createStore } = require('./sqlite');
  const store = createStore({ name: 'orbit' });
  module.exports = {
    dialect: 'sqlite',
    open: store.open,
    query: (sql, params) => store.query(sql, params),
  };
}

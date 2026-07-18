const mysql = require('mysql2');
require('dotenv').config();

const host = process.env.MYSQLHOST || process.env.DB_HOST;
const port = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);

// Aiven (and most cloud MySQL) require SSL. Local MySQL usually does not.
// Force off: DB_SSL=false  |  Force on: DB_SSL=true
const hostLooksCloud =
  typeof host === 'string' &&
  (host.includes('aivencloud.com') ||
    host.includes('rds.amazonaws.com') ||
    host.includes('railway.app') ||
    host.includes('proxy.rlwy.net'));

const sslEnabled =
  process.env.DB_SSL === 'true' ||
  (process.env.DB_SSL !== 'false' && hostLooksCloud);

const pool = mysql.createPool({
  host,
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  port,
  waitForConnections: true,
  connectionLimit: 10,
  ...(sslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
});

module.exports = pool.promise();

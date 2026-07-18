/**
 * Quick DB check (does not print password):
 *   node server/db/test-connection.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('./index');
const { migrate } = require('./migrate');

async function main() {
  console.log('Connecting...', {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    user: process.env.MYSQLUSER || process.env.DB_USER,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    ssl: process.env.DB_SSL || 'auto',
  });

  const [rows] = await db.query('SELECT 1 AS ok, DATABASE() AS db, NOW() AS now');
  console.log('Connection OK:', rows[0]);

  await migrate();
  console.log('Schema migrate OK');

  const [tables] = await db.query('SHOW TABLES');
  console.log(
    'Tables:',
    tables.map((t) => Object.values(t)[0]).join(', ') || '(none)'
  );

  process.exit(0);
}

main().catch((err) => {
  console.error('DB failed:', err.message);
  process.exit(1);
});

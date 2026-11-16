const fs = require('fs');
const path = require('path');
const db = require('./index');
const { toSqliteSchema } = require('./sqlite');

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  let sql = fs.readFileSync(schemaPath, 'utf8');
  if (db.dialect === 'sqlite') sql = toSqliteSchema(sql);

  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    await db.query(statement);
  }
}

async function seed() {
  if (db.dialect !== 'sqlite') return;
  const [rows] = await db.query('SELECT COUNT(*) AS c FROM users');
  if (Number(rows[0].c) > 0) return;
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('Demo#2026', 10);
  const [user] = await db.query(
    'INSERT INTO users (name, email, password, avatar_color) VALUES (?, ?, ?, ?)',
    ['Light', 'light@orbit.app', hash, '#7C5CFF']
  );
  const [project] = await db.query(
    'INSERT INTO projects (name, description, owner_id, color, status) VALUES (?, ?, ?, ?, ?)',
    ['Fischer prep', 'Opening notes and tactics for the week', user.insertId, '#7C5CFF', 'active']
  );
  await db.query(
    'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
    [project.insertId, user.insertId, 'owner']
  );
  await db.query(
    'INSERT INTO tasks (project_id, title, description, status, priority, created_by, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [project.insertId, 'Review Najdorf lines', 'Cover the poisoned pawn and English attack', 'todo', 'high', user.insertId, 0]
  );
  await db.query(
    'INSERT INTO tasks (project_id, title, status, priority, created_by, position) VALUES (?, ?, ?, ?, ?, ?)',
    [project.insertId, 'Solve 20 tactics', 'in_progress', 'medium', user.insertId, 1]
  );
}

let ready;
function ensure() {
  if (!ready) {
    ready = migrate()
      .then(seed)
      .catch((err) => {
        ready = null;
        throw err;
      });
  }
  return ready;
}

module.exports = { migrate, seed, ensure };

if (require.main === module) {
  ensure()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err.message);
      process.exit(1);
    });
}

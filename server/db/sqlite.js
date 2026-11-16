const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function translate(sql) {
  return sql
    .replace(/DATE_SUB\(\s*NOW\(\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "datetime('now', '-$1 day')")
    .replace(/NOW\(\)\s*-\s*INTERVAL\s+(\d+)\s+DAY/gi, "datetime('now', '-$1 day')")
    .replace(/\bCURDATE\(\)/gi, "date('now')")
    .replace(/\bNOW\(\)/gi, "datetime('now')")
    .replace(/\bLAST_INSERT_ID\(\)/gi, 'last_insert_rowid()')
    .replace(/\bDATE\s*\(/gi, 'date(')
    .replace(/"([^"]*)"/g, "'$1'");
}

function plain(row) {
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = typeof value === 'bigint' ? Number(value) : value;
  }
  return out;
}

function createStore({ name, schema }) {
  const file = process.env.SQLITE_FILE || path.join('/tmp', `${name}.sqlite`);
  const blobPath = `db/${name}.sqlite`;
  let db;
  let opening;

  async function loadBlob() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
    const { get } = await import('@vercel/blob');
    try {
      const result = await get(blobPath, { access: 'private' });
      if (!result || result.statusCode === 404) return null;
      if (result.stream) {
        const chunks = [];
        for await (const chunk of result.stream) chunks.push(Buffer.from(chunk));
        return Buffer.concat(chunks);
      }
      if (typeof result.arrayBuffer === 'function') {
        return Buffer.from(await result.arrayBuffer());
      }
      return null;
    } catch (err) {
      const msg = String(err && err.message);
      if (!/404|not found|BlobNotFound/i.test(msg)) console.error('blob load', msg);
      return null;
    }
  }

  async function saveBlob() {
    if (!process.env.BLOB_READ_WRITE_TOKEN || !fs.existsSync(file)) return;
    const { put } = await import('@vercel/blob');
    await put(blobPath, fs.readFileSync(file), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/octet-stream',
    });
  }

  async function open() {
    if (db) return db;
    if (!opening) {
      opening = (async () => {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        const bytes = await loadBlob();
        if (bytes && bytes.length) fs.writeFileSync(file, bytes);
        db = new DatabaseSync(file);
        db.exec('PRAGMA foreign_keys = ON');
        db.exec('PRAGMA journal_mode = DELETE');
        if (schema) {
          const exists = db.prepare(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'"
          ).get();
          if (!exists) db.exec(schema);
        }
      })().catch((err) => {
        opening = null;
        throw err;
      });
    }
    await opening;
    return db;
  }

  async function query(sql, params = []) {
    const database = await open();
    const statement = translate(sql).trim().replace(/;$/, '');
    const write = /^(insert|update|delete|replace|create|drop|alter)/i.test(statement);
    try {
      if (write) {
        const info = database.prepare(statement).run(...params);
        const header = {
          insertId: Number(info.lastInsertRowid || 0),
          affectedRows: Number(info.changes || 0),
        };
        await saveBlob();
        return [header, null];
      }
      const rows = database.prepare(statement).all(...params).map(plain);
      return [rows, null];
    } catch (err) {
      err.message = `${err.message} | SQL: ${statement}`;
      throw err;
    }
  }

  return { query, dialect: 'sqlite', open, save: saveBlob };
}

function toSqliteSchema(sql) {
  return sql
    .replace(/INT\s+AUTO_INCREMENT\s+PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/ENUM\([^)]*\)/gi, 'TEXT')
    .replace(/UNIQUE KEY \w+\s*\(([^)]+)\)/gi, 'UNIQUE ($1)')
    .replace(/\bVARCHAR\(\d+\)/gi, 'TEXT')
    .replace(/\bTIMESTAMP\b/gi, 'TEXT')
    .replace(/\bDATETIME\b/gi, 'TEXT')
    .replace(/\bDATE\b/gi, 'TEXT')
    .replace(/\bINT\b/gi, 'INTEGER');
}

module.exports = { createStore, toSqliteSchema };

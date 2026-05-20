const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

let db = null;
let migrated = false;

function getDbPath() {
  const envPath = process.env.DATABASE_PATH;
  if (envPath) {
    return path.isAbsolute(envPath)
      ? envPath
      : path.join(process.cwd(), envPath);
  }
  return path.join(process.cwd(), 'data', 'habitmeet.db');
}

function convertQuery(sql, params = []) {
  const expandedParams = [];
  const sqliteSql = sql.replace(/\$(\d+)/g, (_, num) => {
    const index = parseInt(num, 10) - 1;
    expandedParams.push(params[index]);
    return '?';
  });
  return { sql: sqliteSql, params: expandedParams };
}

function getDb() {
  if (!db) {
    const dbPath = getDbPath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    if (!migrated) {
      runMigrations();
      migrated = true;
    }
  }
  return db;
}

function runMigrations() {
  const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  const database = getDb();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    database.exec(sql);
  }
  ensureHabitTypeColumn(database);
}

function ensureHabitTypeColumn(database) {
  const cols = database.prepare('PRAGMA table_info(habits)').all();
  if (cols.some((c) => c.name === 'type_id')) return;

  database.exec(
    'ALTER TABLE habits ADD COLUMN type_id INTEGER REFERENCES activity_types(id)'
  );

  const habits = database
    .prepare('SELECT id, name, user_id FROM habits WHERE type_id IS NULL')
    .all();

  for (const habit of habits) {
    let typeRow = database
      .prepare('SELECT id FROM activity_types WHERE name = ? COLLATE NOCASE')
      .get(habit.name);
    if (!typeRow) {
      const ins = database
        .prepare('INSERT INTO activity_types (name, created_by) VALUES (?, ?)')
        .run(habit.name, habit.user_id);
      typeRow = { id: ins.lastInsertRowid };
    }
    database.prepare('UPDATE habits SET type_id = ? WHERE id = ?').run(typeRow.id, habit.id);
  }
}

function query(sql, params = []) {
  const { sql: sqliteSql, params: expanded } = convertQuery(sql, params);
  const database = getDb();
  const stmt = database.prepare(sqliteSql);
  const upper = sqliteSql.trim().toUpperCase();

  if (upper.startsWith('SELECT') || upper.includes('RETURNING')) {
    return Promise.resolve({ rows: stmt.all(...expanded) });
  }

  stmt.run(...expanded);
  return Promise.resolve({ rows: [] });
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
    migrated = false;
  }
}

module.exports = { query, getDb, runMigrations, closeDb, getDbPath };

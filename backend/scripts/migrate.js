require('dotenv').config();
const fs = require('fs');
const { getDbPath, closeDb, getDb } = require('../src/config/db');

const dbPath = getDbPath();

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  const wal = `${dbPath}-wal`;
  const shm = `${dbPath}-shm`;
  if (fs.existsSync(wal)) fs.unlinkSync(wal);
  if (fs.existsSync(shm)) fs.unlinkSync(shm);
  console.log('Existing database removed.');
}

try {
  getDb();
  console.log(`Migration completed: ${dbPath}`);
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  closeDb();
}

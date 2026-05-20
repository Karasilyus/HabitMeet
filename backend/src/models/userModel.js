const { query } = require('../config/db');

async function findByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await query(
    'SELECT id, name, email, neighborhood, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function create({ name, email, password, neighborhood }) {
  const result = await query(
    `INSERT INTO users (name, email, password, neighborhood)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, neighborhood, created_at`,
    [name, email, password, neighborhood]
  );
  return result.rows[0];
}

async function findByNeighborhood(neighborhood, excludeUserId) {
  const result = await query(
    `SELECT id, name, email, neighborhood, created_at FROM users
     WHERE neighborhood = $1 AND id != $2`,
    [neighborhood, excludeUserId]
  );
  return result.rows;
}

async function updatePassword(id, passwordHash) {
  await query('UPDATE users SET password = $1 WHERE id = $2', [passwordHash, id]);
}

module.exports = { findByEmail, findById, create, findByNeighborhood, updatePassword };

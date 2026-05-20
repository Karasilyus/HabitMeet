const { query } = require('../config/db');

async function findAll() {
  const result = await query(
    `SELECT fp.*, u.name AS author_name, h.name AS habit_name
     FROM forum_posts fp
     JOIN users u ON u.id = fp.user_id
     JOIN habits h ON h.id = fp.habit_id
     ORDER BY fp.created_at DESC`
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM forum_posts WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function create({ userId, habitId, title, body }) {
  const result = await query(
    `INSERT INTO forum_posts (user_id, habit_id, title, body)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, habitId, title, body]
  );
  return result.rows[0];
}

async function update(id, { title, body }) {
  const result = await query(
    `UPDATE forum_posts SET title = $1, body = $2 WHERE id = $3 RETURNING *`,
    [title, body, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await query('DELETE FROM forum_posts WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
}

module.exports = { findAll, findById, create, update, remove };

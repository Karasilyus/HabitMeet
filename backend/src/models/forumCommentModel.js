const { query } = require('../config/db');

async function findByPostId(postId) {
  const result = await query(
    `SELECT fc.*, u.name AS author_name
     FROM forum_comments fc
     JOIN users u ON u.id = fc.user_id
     WHERE fc.post_id = $1
     ORDER BY fc.created_at ASC`,
    [postId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM forum_comments WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function create({ userId, postId, body }) {
  const result = await query(
    `INSERT INTO forum_comments (post_id, user_id, body)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [postId, userId, body]
  );
  return result.rows[0];
}

async function remove(id) {
  const result = await query('DELETE FROM forum_comments WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
}

module.exports = { findByPostId, findById, create, remove };
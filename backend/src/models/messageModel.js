const { query } = require('../config/db');

async function findByMatchId(matchId) {
  const result = await query(
    `SELECT m.*, u.name AS sender_name
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.match_id = $1
     ORDER BY m.created_at ASC`,
    [matchId]
  );
  return result.rows;
}

async function create({ matchId, senderId, body }) {
  const result = await query(
    `INSERT INTO messages (match_id, sender_id, body)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [matchId, senderId, body]
  );
  return result.rows[0];
}

async function markAsRead(matchId, readerId) {
  await query(
    `UPDATE messages SET is_read = 1
     WHERE match_id = $1 AND sender_id != $2 AND is_read = 0`,
    [matchId, readerId]
  );
}

module.exports = { findByMatchId, create, markAsRead };

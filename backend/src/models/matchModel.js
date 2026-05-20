const { query } = require('../config/db');

function normalizePair(userId1, userId2) {
  return userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
}

async function findByUserId(userId) {
  const result = await query(
    `SELECT m.*,
            h.name AS habit_name, h.category AS habit_category,
            u1.name AS user1_name, u2.name AS user2_name,
            CASE WHEN m.user_id1 = $1 THEN m.user_id2 ELSE m.user_id1 END AS partner_id,
            CASE WHEN m.user_id1 = $1 THEN u2.name ELSE u1.name END AS partner_name
     FROM matches m
     JOIN habits h ON h.id = m.habit_id
     JOIN users u1 ON u1.id = m.user_id1
     JOIN users u2 ON u2.id = m.user_id2
     WHERE m.user_id1 = $1 OR m.user_id2 = $1
     ORDER BY m.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function findExisting(userId1, userId2, habitId) {
  const [uid1, uid2] = normalizePair(userId1, userId2);
  const result = await query(
    'SELECT * FROM matches WHERE user_id1 = $1 AND user_id2 = $2 AND habit_id = $3',
    [uid1, uid2, habitId]
  );
  return result.rows[0] || null;
}

async function create(userId1, userId2, habitId) {
  const [uid1, uid2] = normalizePair(userId1, userId2);
  const result = await query(
    `INSERT INTO matches (user_id1, user_id2, habit_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [uid1, uid2, habitId]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await query('SELECT * FROM matches WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function isParticipant(matchId, userId) {
  const result = await query(
    'SELECT id FROM matches WHERE id = $1 AND (user_id1 = $2 OR user_id2 = $2)',
    [matchId, userId]
  );
  return result.rows.length > 0;
}

module.exports = {
  findByUserId,
  findExisting,
  create,
  findById,
  isParticipant,
  normalizePair,
};

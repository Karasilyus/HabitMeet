const { query } = require('../config/db');

async function create({ userId, tokenHash, expiresAt }) {
  await query(
    'DELETE FROM password_reset_tokens WHERE user_id = $1 AND used_at IS NULL',
    [userId]
  );
  const result = await query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0];
}

async function findValidByHash(tokenHash) {
  const result = await query(
    `SELECT prt.*, u.email FROM password_reset_tokens prt
     JOIN users u ON u.id = prt.user_id
     WHERE prt.token_hash = $1 AND prt.used_at IS NULL AND prt.expires_at > datetime('now')`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function markUsed(id) {
  await query(
    `UPDATE password_reset_tokens SET used_at = datetime('now') WHERE id = $1`,
    [id]
  );
}

module.exports = { create, findValidByHash, markUsed };

const { query } = require('../config/db');

const HABIT_SELECT = `h.id, h.user_id, h.name, h.type_id, h.created_at,
  at.name AS type_name, at.created_by AS type_created_by`;

async function findByUserId(userId) {
  const result = await query(
    `SELECT ${HABIT_SELECT} FROM habits h
     JOIN activity_types at ON at.id = h.type_id
     WHERE h.user_id = $1
     ORDER BY at.name ASC, h.created_at ASC`,
    [userId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await query(
    `SELECT h.*, at.name AS type_name FROM habits h
     JOIN activity_types at ON at.id = h.type_id
     WHERE h.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function create({ userId, name, typeId }) {
  const result = await query(
    `INSERT INTO habits (user_id, name, category, type_id) VALUES ($1, $2, '', $3)
     RETURNING id, user_id, name, type_id, created_at`,
    [userId, name, typeId]
  );
  const row = result.rows[0];
  const type = await query('SELECT name FROM activity_types WHERE id = $1', [typeId]);
  return { ...row, type_name: type.rows[0]?.name };
}

async function update(id, { name, typeId }) {
  const result = await query(
    `UPDATE habits SET name = $1, type_id = $2 WHERE id = $3
     RETURNING id, user_id, name, type_id, created_at`,
    [name, typeId, id]
  );
  const row = result.rows[0];
  if (!row) return null;
  const type = await query('SELECT name FROM activity_types WHERE id = $1', [typeId]);
  return { ...row, type_name: type.rows[0]?.name };
}

async function remove(id) {
  const result = await query('DELETE FROM habits WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
}

async function findByNeighborhoodAndType(neighborhood, typeId, excludeUserId) {
  const result = await query(
    `SELECT h.*, at.name AS type_name FROM habits h
     JOIN users u ON u.id = h.user_id
     JOIN activity_types at ON at.id = h.type_id
     WHERE u.neighborhood = $1 AND h.type_id = $2 AND h.user_id != $3`,
    [neighborhood, typeId, excludeUserId]
  );
  return result.rows;
}

async function userHasType(userId, typeId) {
  const result = await query(
    'SELECT id FROM habits WHERE user_id = $1 AND type_id = $2 LIMIT 1',
    [userId, typeId]
  );
  return result.rows.length > 0;
}

module.exports = {
  findByUserId,
  findById,
  create,
  update,
  remove,
  findByNeighborhoodAndType,
  userHasType,
};

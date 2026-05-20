const { query } = require('../config/db');

async function findAll() {
  const result = await query(
    `SELECT at.*,
            u.name AS creator_name,
            (SELECT COUNT(*) FROM habits h WHERE h.type_id = at.id) AS usage_count
     FROM activity_types at
     LEFT JOIN users u ON u.id = at.created_by
     ORDER BY usage_count DESC, at.name ASC`
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM activity_types WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function findByName(name) {
  const result = await query(
    'SELECT * FROM activity_types WHERE name = $1 COLLATE NOCASE',
    [name.trim()]
  );
  return result.rows[0] || null;
}

async function create({ name, createdBy }) {
  const result = await query(
    `INSERT INTO activity_types (name, created_by) VALUES ($1, $2)
     RETURNING *`,
    [name.trim(), createdBy || null]
  );
  return result.rows[0];
}

module.exports = { findAll, findById, findByName, create };

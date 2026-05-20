const { query } = require('../config/db');

async function create({
  reportedUserId = null,
  reportedPostId = null,
  reportedActivityId = null,
  reporterId,
  reason,
  description = '',
}) {
  const result = await query(
    `INSERT INTO reports (reported_user_id, reported_post_id, reported_activity_id, reporter_id, reason, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [reportedUserId, reportedPostId, reportedActivityId, reporterId, reason, description]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await query('SELECT * FROM reports WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function findByStatus(status) {
  const result = await query(
    'SELECT * FROM reports WHERE status = $1 ORDER BY created_at DESC',
    [status]
  );
  return result.rows;
}

async function findAll() {
  const result = await query('SELECT * FROM reports ORDER BY created_at DESC');
  return result.rows;
}

async function update(id, { status, reviewedBy } = {}) {
  const updates = [];
  const values = [];
  let placeholderIndex = 1;

  if (status !== undefined) {
    updates.push(`status = $${placeholderIndex++}`);
    values.push(status);
  }
  if (reviewedBy !== undefined) {
    updates.push(`reviewed_by = $${placeholderIndex++}`);
    values.push(reviewedBy);
  }
  if (updates.length > 0) {
    updates.push('reviewed_at = datetime("now")');
  }

  if (updates.length === 0) return findById(id);

  values.push(id);
  const queryText = `UPDATE reports SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;
  const result = await query(queryText, values);
  return result.rows[0] || null;
}

async function countByUser(userId, status = null) {
  if (status) {
    const result = await query(
      'SELECT COUNT(*) as count FROM reports WHERE reported_user_id = $1 AND status = $2',
      [userId, status]
    );
    return result.rows[0].count;
  }
  const result = await query(
    'SELECT COUNT(*) as count FROM reports WHERE reported_user_id = $1',
    [userId]
  );
  return result.rows[0].count;
}

module.exports = {
  create,
  findById,
  findByStatus,
  findAll,
  update,
  countByUser,
};

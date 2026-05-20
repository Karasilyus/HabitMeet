const { query } = require('../config/db');

async function findByUserId(userId, fromDate, toDate) {
  const result = await query(
    `SELECT * FROM sleep_logs WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date ASC`,
    [userId, fromDate, toDate]
  );
  return result.rows;
}

async function upsert({ userId, date, hours }) {
  const result = await query(
    `INSERT INTO sleep_logs (user_id, date, hours)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, date)
     DO UPDATE SET hours = excluded.hours
     RETURNING *`,
    [userId, date, hours]
  );
  return result.rows[0];
}

module.exports = { findByUserId, upsert };

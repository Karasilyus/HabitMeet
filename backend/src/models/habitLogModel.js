const { query } = require('../config/db');

async function findByHabitId(habitId) {
  const result = await query(
    'SELECT * FROM habit_logs WHERE habit_id = $1 ORDER BY date DESC',
    [habitId]
  );
  return result.rows.map(normalizeLog);
}

async function findByHabitIdsInRange(habitIds, fromDate, toDate) {
  if (!habitIds.length) return [];
  const placeholders = habitIds.map((_, i) => `$${i + 3}`).join(',');
  const result = await query(
    `SELECT * FROM habit_logs
     WHERE habit_id IN (${placeholders}) AND date >= $1 AND date <= $2`,
    [fromDate, toDate, ...habitIds]
  );
  return result.rows.map(normalizeLog);
}

async function findByHabitIdAndDate(habitId, date) {
  const result = await query(
    'SELECT * FROM habit_logs WHERE habit_id = $1 AND date = $2',
    [habitId, date]
  );
  const row = result.rows[0];
  return row ? normalizeLog(row) : null;
}

async function upsertLog(habitId, date, completed = true) {
  const completedVal = completed ? 1 : 0;
  const result = await query(
    `INSERT INTO habit_logs (habit_id, date, completed)
     VALUES ($1, $2, $3)
     ON CONFLICT (habit_id, date)
     DO UPDATE SET completed = excluded.completed
     RETURNING *`,
    [habitId, date, completedVal]
  );
  return normalizeLog(result.rows[0]);
}

async function removeLog(habitId, date) {
  await query('DELETE FROM habit_logs WHERE habit_id = $1 AND date = $2', [habitId, date]);
}

function normalizeLog(row) {
  if (!row) return row;
  return { ...row, completed: row.completed === 1 || row.completed === true };
}

module.exports = {
  findByHabitId,
  findByHabitIdsInRange,
  findByHabitIdAndDate,
  upsertLog,
  removeLog,
};

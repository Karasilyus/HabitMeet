/**
 * Calculates consecutive completed days from today backwards.
 * @param {Array<{date: string|Date, completed: boolean}>} logs
 * @param {Date} [referenceDate] - defaults to today (UTC date)
 * @returns {number}
 */
function calculateStreak(logs, referenceDate = new Date()) {
  if (!logs || logs.length === 0) return 0;

  const completedDates = new Set(
    logs
      .filter((log) => log.completed === true || log.completed === 1)
      .map((log) => formatDateKey(log.date))
  );

  let streak = 0;
  const cursor = startOfDay(referenceDate);

  while (completedDates.has(formatDateKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

function formatDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDay(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

module.exports = { calculateStreak, formatDateKey, startOfDay };

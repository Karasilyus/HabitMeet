function formatDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildDateRange(days, referenceDate = new Date()) {
  const dates = [];
  const end = new Date(referenceDate);
  end.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    dates.push(formatDateKey(d));
  }
  return dates;
}

function buildLogMap(logs) {
  const map = {};
  for (const log of logs) {
    if (log.completed) {
      const key = `${log.habit_id}:${log.date}`;
      map[key] = true;
    }
  }
  return map;
}

function completionPercent(completed, total) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function calculateStats(habits, logs, dates) {
  const habitCount = habits.length;
  const logMap = buildLogMap(logs);
  const today = dates[dates.length - 1];

  let dailyCompleted = 0;
  for (const h of habits) {
    if (logMap[`${h.id}:${today}`]) dailyCompleted += 1;
  }
  const daily = completionPercent(dailyCompleted, habitCount);

  const weekDates = dates.slice(-7);
  let weekCompleted = 0;
  let weekTotal = habitCount * weekDates.length;
  for (const date of weekDates) {
    for (const h of habits) {
      if (logMap[`${h.id}:${date}`]) weekCompleted += 1;
    }
  }
  const weekly = completionPercent(weekCompleted, weekTotal);

  let overallCompleted = 0;
  const overallTotal = habitCount * dates.length;
  for (const date of dates) {
    for (const h of habits) {
      if (logMap[`${h.id}:${date}`]) overallCompleted += 1;
    }
  }
  const overall = completionPercent(overallCompleted, overallTotal);

  return { daily, weekly, overall };
}

module.exports = { buildDateRange, buildLogMap, calculateStats, formatDateKey };

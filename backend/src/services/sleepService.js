const sleepModel = require('../models/sleepModel');
const { buildDateRange } = require('./statsService');

function formatDateOnly(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function getSleepLogs(userId, days = 14) {
  const numDays = Math.min(Math.max(parseInt(days, 10) || 14, 7), 31);
  const dates = buildDateRange(numDays);
  const logs = await sleepModel.findByUserId(userId, dates[0], dates[dates.length - 1]);
  const byDate = {};
  for (const log of logs) {
    byDate[log.date] = log.hours;
  }
  return { dates, logs: byDate, entries: logs };
}

async function saveSleep(userId, { date, hours }) {
  const errors = [];
  if (!date) errors.push('Tarih gerekli');
  const h = parseFloat(hours);
  if (Number.isNaN(h) || h < 0 || h > 24) errors.push('Uyku süresi 0-24 saat arasında olmalı');
  if (errors.length) {
    const err = new Error(errors.join(', '));
    err.status = 400;
    throw err;
  }
  return sleepModel.upsert({
    userId,
    date: formatDateOnly(date),
    hours: Math.round(h * 10) / 10,
  });
}

module.exports = { getSleepLogs, saveSleep };

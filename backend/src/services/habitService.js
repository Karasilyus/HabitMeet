const habitModel = require('../models/habitModel');
const habitLogModel = require('../models/habitLogModel');
const activityTypeModel = require('../models/activityTypeModel');
const { calculateStreak } = require('./streakService');
const { buildDateRange, buildLogMap, calculateStats } = require('./statsService');
const { resolveTypeId } = require('./activityTypeService');
const matchService = require('./matchService');

const DEFAULT_DAYS = 14;

function formatDateOnly(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function logsForHabit(habitId, logMap, dates) {
  const logs = {};
  for (const date of dates) {
    logs[date] = !!logMap[`${habitId}:${date}`];
  }
  return logs;
}

async function listHabits(userId, days = DEFAULT_DAYS) {
  const numDays = Math.min(Math.max(parseInt(days, 10) || DEFAULT_DAYS, 7), 31);
  const dates = buildDateRange(numDays);
  const fromDate = dates[0];
  const toDate = dates[dates.length - 1];

  const habits = await habitModel.findByUserId(userId);
  const allTypes = await activityTypeModel.findAll();
  const usageByType = Object.fromEntries(allTypes.map((t) => [t.id, t.usage_count]));

  const habitIds = habits.map((h) => h.id);
  const rangeLogs = await habitLogModel.findByHabitIdsInRange(habitIds, fromDate, toDate);
  const logMap = buildLogMap(rangeLogs);
  const stats = calculateStats(habits, rangeLogs, dates);

  const enriched = await Promise.all(
    habits.map(async (habit) => {
      const allLogs = await habitLogModel.findByHabitId(habit.id);
      return {
        ...habit,
        type_usage_count: usageByType[habit.type_id] || 0,
        streak: calculateStreak(allLogs),
        logs: logsForHabit(habit.id, logMap, dates),
      };
    })
  );

  return { habits: enriched, dates, stats };
}

async function createHabit(userId, data) {
  const type = await resolveTypeId(userId, {
    type_id: data.type_id,
    type_name: data.type_name,
  });

  const hasType = await habitModel.userHasType(userId, type.id);
  if (hasType) {
    const err = new Error('Bu türde zaten bir hedefiniz var');
    err.status = 409;
    throw err;
  }

  const displayName = type.name;

  return habitModel.create({
    userId,
    name: displayName,
    typeId: type.id,
  });
}

async function updateHabit(userId, habitId, data) {
  const habit = await habitModel.findById(habitId);
  if (!habit) {
    const err = new Error('Habit not found');
    err.status = 404;
    throw err;
  }
  if (habit.user_id !== userId) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  const type = await resolveTypeId(userId, {
    type_id: data.type_id ?? habit.type_id,
    type_name: data.type_name,
  });

  if (type.id !== habit.type_id) {
    const hasType = await habitModel.userHasType(userId, type.id);
    if (hasType) {
      const err = new Error('Bu türde zaten bir hedefiniz var');
      err.status = 409;
      throw err;
    }
  }

  const displayName = type.name;

  return habitModel.update(habitId, { name: displayName, typeId: type.id });
}

async function deleteHabit(userId, habitId) {
  const habit = await habitModel.findById(habitId);
  if (!habit) {
    const err = new Error('Habit not found');
    err.status = 404;
    throw err;
  }
  if (habit.user_id !== userId) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  await habitModel.remove(habitId);
  return { id: habitId };
}

async function toggleHabitLog(userId, habitId, dateInput, completed) {
  const habit = await habitModel.findById(habitId);
  if (!habit) {
    const err = new Error('Habit not found');
    err.status = 404;
    throw err;
  }
  if (habit.user_id !== userId) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  const date = dateInput ? formatDateOnly(dateInput) : formatDateOnly();
  const existing = await habitLogModel.findByHabitIdAndDate(habitId, date);
  const shouldComplete = completed !== undefined ? completed : !(existing && existing.completed);

  let log;
  if (shouldComplete) {
    log = await habitLogModel.upsertLog(habitId, date, true);
  } else if (existing) {
    await habitLogModel.removeLog(habitId, date);
    log = { habit_id: habitId, date, completed: false };
  } else {
    log = { habit_id: habitId, date, completed: false };
  }

  const logs = await habitLogModel.findByHabitId(habitId);
  const streak = calculateStreak(logs);
  let newMatches = [];
  if (shouldComplete) {
    newMatches = await matchService.processMatchesAfterLog(userId, habitId);
  }

  return { log, streak, completed: shouldComplete, newMatches };
}

module.exports = {
  listHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitLog,
};

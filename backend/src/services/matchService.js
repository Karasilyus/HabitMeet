const habitModel = require('../models/habitModel');
const habitLogModel = require('../models/habitLogModel');
const matchModel = require('../models/matchModel');
const userModel = require('../models/userModel');
const { calculateStreak } = require('./streakService');

const MIN_STREAK_DAYS = 7;

/**
 * Same neighborhood + same activity type + streak >= 7 on that habit.
 */
async function processMatchesAfterLog(userId, habitId) {
  const habit = await habitModel.findById(habitId);
  if (!habit || habit.user_id !== userId || !habit.type_id) return [];

  const user = await userModel.findById(userId);
  if (!user) return [];

  const userLogs = await habitLogModel.findByHabitId(habitId);
  if (calculateStreak(userLogs) < MIN_STREAK_DAYS) return [];

  const candidateHabits = await habitModel.findByNeighborhoodAndType(
    user.neighborhood,
    habit.type_id,
    userId
  );

  const newMatches = [];
  const matchedUsers = new Set();

  for (const candidateHabit of candidateHabits) {
    if (matchedUsers.has(candidateHabit.user_id)) continue;

    const candidateLogs = await habitLogModel.findByHabitId(candidateHabit.id);
    if (calculateStreak(candidateLogs) < MIN_STREAK_DAYS) continue;

    const existing = await matchModel.findExisting(userId, candidateHabit.user_id, habitId);
    if (existing) continue;

    const match = await matchModel.create(userId, candidateHabit.user_id, habitId);
    newMatches.push(match);
    matchedUsers.add(candidateHabit.user_id);
  }

  return newMatches;
}

module.exports = { processMatchesAfterLog, MIN_STREAK_DAYS };

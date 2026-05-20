const {
  buildDateRange,
  buildLogMap,
  calculateStats,
  formatDateKey,
} = require('../src/services/statsService');

describe('statsService', () => {
  const ref = new Date('2026-05-17T12:00:00Z');

  test('buildDateRange ends on reference day', () => {
    const dates = buildDateRange(7, ref);
    expect(dates).toHaveLength(7);
    expect(dates[dates.length - 1]).toBe(formatDateKey(ref));
  });

  test('buildLogMap only maps completed logs', () => {
    const map = buildLogMap([
      { habit_id: 1, date: '2026-05-17', completed: true },
      { habit_id: 1, date: '2026-05-16', completed: false },
      { habit_id: 2, date: '2026-05-17', completed: 1 },
    ]);
    expect(map['1:2026-05-17']).toBe(true);
    expect(map['1:2026-05-16']).toBeUndefined();
    expect(map['2:2026-05-17']).toBe(true);
  });

  test('calculateStats returns zero percents when no habits', () => {
    const dates = buildDateRange(7, ref);
    expect(calculateStats([], [], dates)).toEqual({
      daily: 0,
      weekly: 0,
      overall: 0,
    });
  });

  test('calculateStats counts daily and weekly completion', () => {
    const habits = [{ id: 1 }, { id: 2 }];
    const dates = buildDateRange(7, ref);
    const today = dates[dates.length - 1];
    const logs = [
      { habit_id: 1, date: today, completed: true },
      { habit_id: 2, date: today, completed: false },
      { habit_id: 1, date: dates[0], completed: true },
    ];
    const stats = calculateStats(habits, logs, dates);
    expect(stats.daily).toBe(50);
    expect(stats.overall).toBeGreaterThan(0);
    expect(stats.weekly).toBeGreaterThan(0);
  });
});

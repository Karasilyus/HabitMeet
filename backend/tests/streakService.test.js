const { calculateStreak } = require('../src/services/streakService');

describe('streakService', () => {
  const today = new Date('2026-05-17T12:00:00Z');

  function daysAgo(n, ref = today) {
    const d = new Date(ref);
    d.setUTCDate(d.getUTCDate() - n);
    return d.toISOString().split('T')[0];
  }

  test('returns 0 when no logs exist', () => {
    expect(calculateStreak([], today)).toBe(0);
  });

  test('returns 0 when today is not completed', () => {
    const logs = [
      { date: daysAgo(1), completed: true },
      { date: daysAgo(2), completed: true },
    ];
    expect(calculateStreak(logs, today)).toBe(0);
  });

  test('counts consecutive days including today', () => {
    const logs = [
      { date: daysAgo(0), completed: true },
      { date: daysAgo(1), completed: true },
      { date: daysAgo(2), completed: true },
      { date: daysAgo(3), completed: false },
    ];
    expect(calculateStreak(logs, today)).toBe(3);
  });

  test('stops at first gap in streak', () => {
    const logs = [
      { date: daysAgo(0), completed: true },
      { date: daysAgo(1), completed: false },
      { date: daysAgo(2), completed: true },
    ];
    expect(calculateStreak(logs, today)).toBe(1);
  });

  test('ignores incomplete days in the middle of older streak', () => {
    const logs = [
      { date: daysAgo(0), completed: true },
      { date: daysAgo(1), completed: true },
    ];
    expect(calculateStreak(logs, today)).toBe(2);
  });

  test('treats completed=1 as completed', () => {
    const logs = [{ date: daysAgo(0), completed: 1 }];
    expect(calculateStreak(logs, today)).toBe(1);
  });
});

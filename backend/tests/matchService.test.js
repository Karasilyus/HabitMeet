jest.mock('../src/models/habitModel');
jest.mock('../src/models/habitLogModel');
jest.mock('../src/models/matchModel');
jest.mock('../src/models/userModel');

const habitModel = require('../src/models/habitModel');
const habitLogModel = require('../src/models/habitLogModel');
const matchModel = require('../src/models/matchModel');
const userModel = require('../src/models/userModel');
const { processMatchesAfterLog, MIN_STREAK_DAYS } = require('../src/services/matchService');

describe('matchService', () => {
  const today = new Date('2026-05-17T12:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(today);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function buildLogs(streakDays) {
    const logs = [];
    for (let i = 0; i < streakDays; i++) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      logs.push({ date: d.toISOString().split('T')[0], completed: true });
    }
    return logs;
  }

  test('does not create matches when user streak is below minimum', async () => {
    habitModel.findById.mockResolvedValue({ id: 1, user_id: 10, type_id: 5 });
    userModel.findById.mockResolvedValue({ id: 10, neighborhood: 'Kadıköy' });
    habitLogModel.findByHabitId.mockResolvedValue(buildLogs(MIN_STREAK_DAYS - 1));

    const result = await processMatchesAfterLog(10, 1);

    expect(result).toEqual([]);
    expect(matchModel.create).not.toHaveBeenCalled();
  });

  test('creates match when same neighborhood and activity type with sufficient streak', async () => {
    habitModel.findById.mockResolvedValue({ id: 1, user_id: 10, type_id: 5 });
    userModel.findById.mockResolvedValue({ id: 10, neighborhood: 'Kadıköy' });
    habitLogModel.findByHabitId
      .mockResolvedValueOnce(buildLogs(7))
      .mockResolvedValueOnce(buildLogs(7));
    habitModel.findByNeighborhoodAndType.mockResolvedValue([{ id: 2, user_id: 20, type_id: 5 }]);
    matchModel.findExisting.mockResolvedValue(null);
    matchModel.create.mockResolvedValue({
      id: 99,
      user_id1: 10,
      user_id2: 20,
      habit_id: 1,
    });

    const result = await processMatchesAfterLog(10, 1);

    expect(result).toHaveLength(1);
    expect(habitModel.findByNeighborhoodAndType).toHaveBeenCalledWith('Kadıköy', 5, 10);
    expect(matchModel.create).toHaveBeenCalledWith(10, 20, 1);
  });

  test('skips users who already have a match', async () => {
    habitModel.findById.mockResolvedValue({ id: 1, user_id: 10, type_id: 5 });
    userModel.findById.mockResolvedValue({ id: 10, neighborhood: 'Kadıköy' });
    habitLogModel.findByHabitId.mockResolvedValue(buildLogs(7));
    habitModel.findByNeighborhoodAndType.mockResolvedValue([{ id: 2, user_id: 20, type_id: 5 }]);
    matchModel.findExisting.mockResolvedValue({ id: 50 });

    const result = await processMatchesAfterLog(10, 1);

    expect(result).toEqual([]);
    expect(matchModel.create).not.toHaveBeenCalled();
  });
});

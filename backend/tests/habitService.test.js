jest.mock('../src/models/habitModel');
jest.mock('../src/models/habitLogModel');
jest.mock('../src/models/activityTypeModel');
jest.mock('../src/services/matchService');

const habitModel = require('../src/models/habitModel');
const habitLogModel = require('../src/models/habitLogModel');
const activityTypeModel = require('../src/models/activityTypeModel');
const matchService = require('../src/services/matchService');
const {
  createHabit,
  deleteHabit,
  toggleHabitLog,
} = require('../src/services/habitService');

describe('habitService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-17T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('createHabit throws 409 when user already has that type', async () => {
    activityTypeModel.findById.mockResolvedValue({ id: 3, name: 'Koşu' });
    habitModel.userHasType.mockResolvedValue(true);

    await expect(createHabit(10, { type_id: 3 })).rejects.toMatchObject({
      status: 409,
    });
  });

  test('createHabit creates habit with resolved type name', async () => {
    activityTypeModel.findById.mockResolvedValue({ id: 3, name: 'Koşu' });
    habitModel.userHasType.mockResolvedValue(false);
    habitModel.create.mockResolvedValue({ id: 1, name: 'Koşu', type_id: 3 });

    const habit = await createHabit(10, { type_id: 3 });
    expect(habit.name).toBe('Koşu');
    expect(habitModel.create).toHaveBeenCalledWith({
      userId: 10,
      name: 'Koşu',
      typeId: 3,
    });
  });

  test('deleteHabit throws 403 for another users habit', async () => {
    habitModel.findById.mockResolvedValue({ id: 1, user_id: 99 });

    await expect(deleteHabit(10, 1)).rejects.toMatchObject({ status: 403 });
  });

  test('toggleHabitLog completes log and triggers match processing', async () => {
    habitModel.findById.mockResolvedValue({ id: 1, user_id: 10 });
    habitLogModel.findByHabitIdAndDate.mockResolvedValue(null);
    habitLogModel.upsertLog.mockResolvedValue({
      habit_id: 1,
      date: '2026-05-17',
      completed: true,
    });
    habitLogModel.findByHabitId.mockResolvedValue([
      { date: '2026-05-17', completed: true },
    ]);
    matchService.processMatchesAfterLog.mockResolvedValue([{ id: 99 }]);

    const result = await toggleHabitLog(10, 1);

    expect(result.completed).toBe(true);
    expect(result.newMatches).toHaveLength(1);
    expect(matchService.processMatchesAfterLog).toHaveBeenCalledWith(10, 1);
  });

  test('toggleHabitLog removes log when toggling off', async () => {
    habitModel.findById.mockResolvedValue({ id: 1, user_id: 10 });
    habitLogModel.findByHabitIdAndDate.mockResolvedValue({
      habit_id: 1,
      date: '2026-05-17',
      completed: true,
    });
    habitLogModel.findByHabitId.mockResolvedValue([]);

    const result = await toggleHabitLog(10, 1, '2026-05-17', false);

    expect(result.completed).toBe(false);
    expect(habitLogModel.removeLog).toHaveBeenCalledWith(1, '2026-05-17');
    expect(matchService.processMatchesAfterLog).not.toHaveBeenCalled();
  });
});

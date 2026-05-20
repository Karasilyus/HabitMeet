jest.mock('../src/models/sleepModel');

const sleepModel = require('../src/models/sleepModel');
const { saveSleep } = require('../src/services/sleepService');

describe('sleepService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('saveSleep rejects missing date', async () => {
    await expect(saveSleep(1, { date: '', hours: 7 })).rejects.toMatchObject({
      status: 400,
    });
  });

  test('saveSleep rejects invalid hours', async () => {
    await expect(
      saveSleep(1, { date: '2026-05-17', hours: 25 })
    ).rejects.toMatchObject({ status: 400 });
  });

  test('saveSleep upserts valid entry', async () => {
    sleepModel.upsert.mockResolvedValue({
      user_id: 1,
      date: '2026-05-17',
      hours: 7.5,
    });

    const entry = await saveSleep(1, { date: '2026-05-17', hours: '7.55' });
    expect(entry.hours).toBe(7.5);
    expect(sleepModel.upsert).toHaveBeenCalledWith({
      userId: 1,
      date: '2026-05-17',
      hours: 7.6,
    });
  });
});

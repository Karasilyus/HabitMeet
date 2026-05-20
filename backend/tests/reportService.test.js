jest.mock('../src/models/reportModel');
jest.mock('../src/models/userModel');
jest.mock('../src/models/forumModel');
jest.mock('../src/models/activityTypeModel');

const userModel = require('../src/models/userModel');
const reportModel = require('../src/models/reportModel');
const { createReport, REPORT_REASONS } = require('../src/services/reportService');

describe('reportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createReport rejects missing target and invalid reason', async () => {
    await expect(
      createReport(1, { reason: 'invalid' })
    ).rejects.toMatchObject({ status: 400 });
  });

  test('createReport rejects multiple targets at once', async () => {
    await expect(
      createReport(1, {
        reportedUserId: 2,
        reportedPostId: 3,
        reason: REPORT_REASONS[0],
      })
    ).rejects.toMatchObject({ status: 400 });
  });

  test('createReport creates user report when target exists', async () => {
    userModel.findById.mockResolvedValue({ id: 2 });
    reportModel.create.mockResolvedValue({ id: 10 });

    const report = await createReport(1, {
      reportedUserId: 2,
      reason: REPORT_REASONS[0],
      description: 'Uygunsuz davranış',
    });

    expect(report.id).toBe(10);
    expect(reportModel.create).toHaveBeenCalled();
  });
});

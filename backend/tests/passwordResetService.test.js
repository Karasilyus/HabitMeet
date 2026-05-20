jest.mock('../src/models/userModel');
jest.mock('../src/models/passwordResetModel');
jest.mock('../src/services/emailService');

const userModel = require('../src/models/userModel');
const passwordResetModel = require('../src/models/passwordResetModel');
const { sendPasswordResetEmail } = require('../src/services/emailService');
const { requestReset, resetPassword } = require('../src/services/passwordResetService');

describe('passwordResetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendPasswordResetEmail.mockResolvedValue({ sent: true });
  });

  test('requestReset rejects invalid email', async () => {
    await expect(requestReset('not-an-email')).rejects.toMatchObject({ status: 400 });
  });

  test('requestReset returns generic message when user not found', async () => {
    userModel.findByEmail.mockResolvedValue(null);
    const result = await requestReset('missing@example.com');
    expect(result.message).toMatch(/gönderildi/i);
    expect(passwordResetModel.create).not.toHaveBeenCalled();
  });

  test('requestReset creates token for existing user', async () => {
    userModel.findByEmail.mockResolvedValue({ id: 3, email: 'user@example.com' });
    passwordResetModel.create.mockResolvedValue({ id: 1 });

    const result = await requestReset('user@example.com');
    expect(result.message).toMatch(/gönderildi/i);
    expect(passwordResetModel.create).toHaveBeenCalled();
    expect(sendPasswordResetEmail).toHaveBeenCalled();
  });

  test('resetPassword rejects short password', async () => {
    await expect(
      resetPassword('a'.repeat(32), '123')
    ).rejects.toMatchObject({ status: 400 });
  });

  test('resetPassword rejects invalid token', async () => {
    passwordResetModel.findValidByHash.mockResolvedValue(null);
    await expect(
      resetPassword('a'.repeat(32), 'newpass1')
    ).rejects.toMatchObject({ status: 400 });
  });
});

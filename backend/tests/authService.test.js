jest.mock('../src/models/userModel');

const bcrypt = require('bcryptjs');
const userModel = require('../src/models/userModel');
const {
  register,
  login,
  validateRegisterInput,
  validateLoginInput,
} = require('../src/services/authService');

describe('authService', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateRegisterInput', () => {
    test('returns errors for invalid fields', () => {
      const errors = validateRegisterInput({
        name: 'A',
        email: 'bad',
        password: '123',
        neighborhood: 'InvalidPlace',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    test('returns no errors for valid Kadıköy registration', () => {
      const errors = validateRegisterInput({
        name: 'Ali Veli',
        email: 'ali@example.com',
        password: 'secret12',
        neighborhood: 'Kadıköy',
      });
      expect(errors).toEqual([]);
    });
  });

  describe('validateLoginInput', () => {
    test('requires valid email and password', () => {
      expect(validateLoginInput({ email: '', password: '' }).length).toBe(2);
      expect(validateLoginInput({ email: 'a@b.com', password: 'x' })).toEqual([]);
    });
  });

  describe('register', () => {
    test('throws 409 when email exists', async () => {
      userModel.findByEmail.mockResolvedValue({ id: 1 });
      await expect(
        register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password1',
          neighborhood: 'Kadıköy',
        })
      ).rejects.toMatchObject({ status: 409 });
    });

    test('creates user and returns token', async () => {
      userModel.findByEmail.mockResolvedValue(null);
      userModel.create.mockResolvedValue({
        id: 5,
        name: 'Test User',
        email: 'test@example.com',
        neighborhood: 'Kadıköy',
      });

      const result = await register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password1',
        neighborhood: 'Kadıköy',
      });

      expect(result.user.id).toBe(5);
      expect(result.token).toBeDefined();
      expect(userModel.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    test('throws 401 for wrong password', async () => {
      const hash = await bcrypt.hash('correct', 10);
      userModel.findByEmail.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: hash,
        name: 'User',
        neighborhood: 'Kadıköy',
      });

      await expect(
        login({ email: 'user@example.com', password: 'wrong' })
      ).rejects.toMatchObject({ status: 401 });
    });

    test('returns user and token on valid credentials', async () => {
      const password = 'password1';
      const hash = await bcrypt.hash(password, 10);
      userModel.findByEmail.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: hash,
        name: 'User',
        neighborhood: 'Kadıköy',
        created_at: '2026-01-01',
      });

      const result = await login({ email: 'user@example.com', password });
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('user@example.com');
      expect(result.user.isAdmin).toBe(false);
    });
  });
});

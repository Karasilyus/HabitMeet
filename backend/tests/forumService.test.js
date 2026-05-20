jest.mock('../src/models/forumModel');
jest.mock('../src/models/habitModel');

const habitModel = require('../src/models/habitModel');
const forumModel = require('../src/models/forumModel');
const {
  validatePostInput,
  createPost,
} = require('../src/services/forumService');

describe('forumService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validatePostInput', () => {
    test('returns errors for short title and body', () => {
      const errors = validatePostInput({ title: 'ab', body: 'short', habitId: 1 });
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });

    test('rejects forbidden words in title', () => {
      const errors = validatePostInput({
        title: 'siktir başlık',
        body: 'Bu gönderi en az on karakter içeriyor.',
        habitId: 1,
      });
      expect(errors).toContain('Yasaklı kelime içeriyor');
    });

    test('returns no errors for valid input', () => {
      const errors = validatePostInput({
        title: 'Koşu rutini',
        body: 'Her sabah düzenli koşuyorum ve iyi hissediyorum.',
        habitId: 5,
      });
      expect(errors).toEqual([]);
    });
  });

  describe('createPost', () => {
    test('throws 403 when habit belongs to another user', async () => {
      habitModel.findById.mockResolvedValue({ id: 1, user_id: 99 });

      await expect(
        createPost(10, {
          title: 'Koşu rutini',
          body: 'Her sabah düzenli koşuyorum ve iyi hissediyorum.',
          habitId: 1,
        })
      ).rejects.toMatchObject({ status: 403 });
    });

    test('creates post for own habit', async () => {
      habitModel.findById.mockResolvedValue({ id: 1, user_id: 10 });
      forumModel.create.mockResolvedValue({ id: 50, title: 'Koşu rutini' });

      const post = await createPost(10, {
        title: 'Koşu rutini',
        body: 'Her sabah düzenli koşuyorum ve iyi hissediyorum.',
        habitId: 1,
      });

      expect(post.id).toBe(50);
      expect(forumModel.create).toHaveBeenCalled();
    });
  });
});

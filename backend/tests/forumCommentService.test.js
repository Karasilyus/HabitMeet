jest.mock('../src/models/forumCommentModel');
jest.mock('../src/models/forumModel');

const forumModel = require('../src/models/forumModel');
const forumCommentModel = require('../src/models/forumCommentModel');
const { createComment } = require('../src/services/forumCommentService');

describe('forumCommentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createComment rejects short body', async () => {
    await expect(createComment(1, 10, { body: 'ab' })).rejects.toMatchObject({
      status: 400,
    });
  });

  test('createComment rejects forbidden words', async () => {
    await expect(
      createComment(1, 10, { body: 'bu siktir yorum' })
    ).rejects.toMatchObject({ status: 400 });
  });

  test('createComment throws 404 when post missing', async () => {
    forumModel.findById.mockResolvedValue(null);
    await expect(
      createComment(1, 10, { body: 'Güzel paylaşım olmuş' })
    ).rejects.toMatchObject({ status: 404 });
  });

  test('createComment creates comment on existing post', async () => {
    forumModel.findById.mockResolvedValue({ id: 10 });
    forumCommentModel.create.mockResolvedValue({ id: 3, body: 'Harika' });

    const comment = await createComment(1, 10, { body: '  Harika  ' });
    expect(comment.id).toBe(3);
    expect(forumCommentModel.create).toHaveBeenCalledWith({
      userId: 1,
      postId: 10,
      body: 'Harika',
    });
  });
});

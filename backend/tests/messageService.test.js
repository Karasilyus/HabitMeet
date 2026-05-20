jest.mock('../src/models/messageModel');
jest.mock('../src/models/matchModel');

const matchModel = require('../src/models/matchModel');
const messageModel = require('../src/models/messageModel');
const {
  validateMessageInput,
  sendMessage,
} = require('../src/services/messageService');

describe('messageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateMessageInput', () => {
    test('requires non-empty body up to 2000 chars', () => {
      expect(validateMessageInput({ body: '' })).toContain('Message body is required');
      expect(validateMessageInput({ body: 'a'.repeat(2001) })).toContain(
        'Message must be at most 2000 characters'
      );
      expect(validateMessageInput({ body: 'Merhaba' })).toEqual([]);
    });
  });

  describe('sendMessage', () => {
    test('throws 403 when user is not a match participant', async () => {
      matchModel.findById.mockResolvedValue({
        id: 1,
        user_id1: 10,
        user_id2: 20,
      });

      await expect(sendMessage(99, 1, 'Selam')).rejects.toMatchObject({ status: 403 });
    });

    test('creates message for participant', async () => {
      matchModel.findById.mockResolvedValue({
        id: 1,
        user_id1: 10,
        user_id2: 20,
      });
      messageModel.create.mockResolvedValue({ id: 5, body: 'Selam' });

      const msg = await sendMessage(10, 1, '  Selam  ');
      expect(msg.id).toBe(5);
      expect(messageModel.create).toHaveBeenCalledWith({
        matchId: 1,
        senderId: 10,
        body: 'Selam',
      });
    });
  });
});

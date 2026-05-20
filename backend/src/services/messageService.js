const messageModel = require('../models/messageModel');
const matchModel = require('../models/matchModel');

function validateMessageInput({ body }) {
  const errors = [];
  if (!body || body.trim().length < 1) errors.push('Message body is required');
  if (body && body.length > 2000) errors.push('Message must be at most 2000 characters');
  return errors;
}

async function assertMatchParticipant(matchId, userId) {
  const match = await matchModel.findById(matchId);
  if (!match) {
    const err = new Error('Match not found');
    err.status = 404;
    throw err;
  }
  const isParticipant =
    match.user_id1 === userId || match.user_id2 === userId;
  if (!isParticipant) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return match;
}

async function getMessages(userId, matchId) {
  await assertMatchParticipant(matchId, userId);
  await messageModel.markAsRead(matchId, userId);
  return messageModel.findByMatchId(matchId);
}

async function sendMessage(userId, matchId, body) {
  const errors = validateMessageInput({ body });
  if (errors.length) {
    const err = new Error(errors.join(', '));
    err.status = 400;
    throw err;
  }

  await assertMatchParticipant(matchId, userId);
  return messageModel.create({
    matchId,
    senderId: userId,
    body: body.trim(),
  });
}

module.exports = { getMessages, sendMessage, validateMessageInput };

const messageService = require('../services/messageService');

async function list(req, res, next) {
  try {
    const messages = await messageService.getMessages(
      req.user.id,
      parseInt(req.params.matchId, 10)
    );
    res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const message = await messageService.sendMessage(
      req.user.id,
      parseInt(req.params.matchId, 10),
      req.body.body
    );
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };

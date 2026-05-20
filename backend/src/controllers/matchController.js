const matchModel = require('../models/matchModel');

async function list(req, res, next) {
  try {
    const matches = await matchModel.findByUserId(req.user.id);
    res.status(200).json({ matches });
  } catch (err) {
    next(err);
  }
}

module.exports = { list };

const sleepService = require('../services/sleepService');

async function list(req, res, next) {
  try {
    const data = await sleepService.getSleepLogs(req.user.id, req.query.days);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function save(req, res, next) {
  try {
    const entry = await sleepService.saveSleep(req.user.id, req.body);
    res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, save };

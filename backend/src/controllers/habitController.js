const habitService = require('../services/habitService');

async function list(req, res, next) {
  try {
    const days = req.query.days;
    const data = await habitService.listHabits(req.user.id, days);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const habit = await habitService.createHabit(req.user.id, req.body);
    res.status(201).json({ habit });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const habit = await habitService.updateHabit(
      req.user.id,
      parseInt(req.params.id, 10),
      req.body
    );
    res.status(200).json({ habit });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await habitService.deleteHabit(
      req.user.id,
      parseInt(req.params.id, 10)
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function log(req, res, next) {
  try {
    const result = await habitService.toggleHabitLog(
      req.user.id,
      parseInt(req.params.id, 10),
      req.body.date,
      req.body.completed
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove, log };

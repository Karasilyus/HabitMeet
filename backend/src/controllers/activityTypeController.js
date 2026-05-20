const activityTypeService = require('../services/activityTypeService');

async function list(req, res, next) {
  try {
    const types = await activityTypeService.listTypes();
    res.status(200).json({ types });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const type = await activityTypeService.createType(req.user.id, req.body.name);
    res.status(201).json({ type });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };

const forumService = require('../services/forumService');

async function list(req, res, next) {
  try {
    const posts = await forumService.listPosts();
    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const post = await forumService.createPost(req.user.id, {
      title: req.body.title,
      body: req.body.body,
      habitId: req.body.habit_id || req.body.habitId,
    });
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const post = await forumService.updatePost(
      req.user.id,
      parseInt(req.params.id, 10),
      req.body
    );
    res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await forumService.deletePost(
      req.user.id,
      parseInt(req.params.id, 10)
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };

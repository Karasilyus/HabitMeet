const forumCommentService = require('../services/forumCommentService');

async function list(req, res, next) {
  try {
    const postId = parseInt(req.params.postId, 10);
    const comments = await forumCommentService.listComments(postId);
    res.status(200).json({ comments });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const postId = parseInt(req.params.postId, 10);
    const comment = await forumCommentService.createComment(req.user.id, postId, {
      body: req.body.body,
    });
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const commentId = parseInt(req.params.id, 10);
    const result = await forumCommentService.deleteComment(req.user.id, commentId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, remove };
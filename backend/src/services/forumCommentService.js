const forumCommentModel = require('../models/forumCommentModel');
const forumModel = require('../models/forumModel');
const { containsForbiddenWords } = require('./contentFilter');

function validateCommentInput({ body }) {
  const errors = [];
  if (!body || body.trim().length < 3) {
    errors.push('Comment must be at least 3 characters');
  }
  if (containsForbiddenWords(body)) {
    errors.push('Yasaklı kelime içeriyor');
  }
  return errors;
}

async function listComments(postId) {
  return forumCommentModel.findByPostId(postId);
}

async function createComment(userId, postId, data) {
  const errors = validateCommentInput(data);
  if (errors.length) {
    const err = new Error(errors.join(', '));
    err.status = 400;
    throw err;
  }

  const post = await forumModel.findById(postId);
  if (!post) {
    const err = new Error('Forum post not found');
    err.status = 404;
    throw err;
  }

  return forumCommentModel.create({
    userId,
    postId,
    body: data.body.trim(),
  });
}

async function deleteComment(userId, commentId) {
  const comment = await forumCommentModel.findById(commentId);
  if (!comment) {
    const err = new Error('Comment not found');
    err.status = 404;
    throw err;
  }
  if (comment.user_id !== userId) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  await forumCommentModel.remove(commentId);
  return { id: commentId };
}

module.exports = { listComments, createComment, deleteComment };
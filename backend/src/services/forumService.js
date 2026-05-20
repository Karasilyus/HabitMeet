const forumModel = require('../models/forumModel');
const habitModel = require('../models/habitModel');

const forbiddenWords = [
  'sex',
  'porn',
  'fuck',
  'shit',
  'bitch',
  'ass',
  'damn',
  'orospu',
  'siktir',
  'sik',
  'pezevenk',
  'anan',
  'kahpe',
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsForbiddenWords(value) {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return forbiddenWords.some((word) => {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
    return regex.test(normalized);
  });
}

function validatePostInput({ title, body, habitId }) {
  const errors = [];
  if (!title || title.trim().length < 3) errors.push('Title must be at least 3 characters');
  if (!body || body.trim().length < 10) errors.push('Body must be at least 10 characters');
  if (containsForbiddenWords(title) || containsForbiddenWords(body)) {
    errors.push('Yasaklı kelime içeriyor');
  }
  if (!habitId) errors.push('Habit is required');
  return errors;
}

async function listPosts() {
  return forumModel.findAll();
}

async function createPost(userId, data) {
  const errors = validatePostInput(data);
  if (errors.length) {
    const err = new Error(errors.join(', '));
    err.status = 400;
    throw err;
  }

  const habit = await habitModel.findById(data.habitId);
  if (!habit) {
    const err = new Error('Habit not found');
    err.status = 404;
    throw err;
  }
  if (habit.user_id !== userId) {
    const err = new Error('You can only post about your own habits');
    err.status = 403;
    throw err;
  }

  return forumModel.create({
    userId,
    habitId: data.habitId,
    title: data.title.trim(),
    body: data.body.trim(),
  });
}

async function updatePost(userId, postId, data) {
  const post = await forumModel.findById(postId);
  if (!post) {
    const err = new Error('Post not found');
    err.status = 404;
    throw err;
  }
  if (post.user_id !== userId) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  const errors = validatePostInput({
    title: data.title,
    body: data.body,
    habitId: post.habit_id,
  });
  if (errors.length) {
    const err = new Error(errors.join(', '));
    err.status = 400;
    throw err;
  }

  return forumModel.update(postId, {
    title: data.title.trim(),
    body: data.body.trim(),
  });
}

async function deletePost(userId, postId) {
  const post = await forumModel.findById(postId);
  if (!post) {
    const err = new Error('Post not found');
    err.status = 404;
    throw err;
  }
  if (post.user_id !== userId) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  await forumModel.remove(postId);
  return { id: postId };
}

module.exports = { listPosts, createPost, updatePost, deletePost, validatePostInput };

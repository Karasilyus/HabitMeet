const express = require('express');
const authRoutes = require('./authRoutes');
const habitRoutes = require('./habitRoutes');
const matchRoutes = require('./matchRoutes');
const forumCommentRoutes = require('./forumCommentRoutes');
const forumRoutes = require('./forumRoutes');
const messageRoutes = require('./messageRoutes');
const sleepRoutes = require('./sleepRoutes');
const metaRoutes = require('./metaRoutes');
const activityTypeRoutes = require('./activityTypeRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/meta', metaRoutes);
router.use('/habits', habitRoutes);
router.use('/matches', matchRoutes);
router.use('/forum/:postId/comments', forumCommentRoutes);
router.use('/forum', forumRoutes);
router.use('/messages', messageRoutes);
router.use('/sleep', sleepRoutes);
router.use('/activity-types', activityTypeRoutes);
router.use('/reports', reportRoutes);

module.exports = router;

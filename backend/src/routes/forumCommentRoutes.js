const express = require('express');
const forumCommentController = require('../controllers/forumCommentController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });
router.use(authMiddleware);
router.get('/', forumCommentController.list);
router.post('/', forumCommentController.create);
router.delete('/:id', forumCommentController.remove);

module.exports = router;

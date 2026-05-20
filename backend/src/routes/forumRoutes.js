const express = require('express');
const forumController = require('../controllers/forumController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', forumController.list);
router.post('/', forumController.create);
router.put('/:id', forumController.update);
router.delete('/:id', forumController.remove);

module.exports = router;

const express = require('express');
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/:matchId', messageController.list);
router.post('/:matchId', messageController.create);

module.exports = router;

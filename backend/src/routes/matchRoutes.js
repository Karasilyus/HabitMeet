const express = require('express');
const matchController = require('../controllers/matchController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', matchController.list);

module.exports = router;

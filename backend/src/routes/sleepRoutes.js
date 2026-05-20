const express = require('express');
const sleepController = require('../controllers/sleepController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', sleepController.list);
router.post('/', sleepController.save);

module.exports = router;

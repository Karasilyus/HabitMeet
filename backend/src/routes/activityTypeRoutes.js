const express = require('express');
const activityTypeController = require('../controllers/activityTypeController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', activityTypeController.list);
router.post('/', activityTypeController.create);

module.exports = router;

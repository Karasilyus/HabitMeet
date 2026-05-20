const express = require('express');
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/adminMiddleware');

const router = express.Router();

router.post('/', authMiddleware, reportController.create);
router.get('/', authMiddleware, adminMiddleware, reportController.list);
router.put('/:id', authMiddleware, adminMiddleware, reportController.review);

module.exports = router;

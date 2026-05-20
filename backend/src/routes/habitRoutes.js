const express = require('express');
const habitController = require('../controllers/habitController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', habitController.list);
router.post('/', habitController.create);
router.put('/:id', habitController.update);
router.delete('/:id', habitController.remove);
router.post('/:id/log', habitController.log);

module.exports = router;

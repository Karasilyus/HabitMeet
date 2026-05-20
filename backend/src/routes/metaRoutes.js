const express = require('express');
const metaController = require('../controllers/metaController');

const router = express.Router();

router.get('/neighborhoods', metaController.neighborhoods);

module.exports = router;

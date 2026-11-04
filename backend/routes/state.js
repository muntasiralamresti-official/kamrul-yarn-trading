const express = require('express');
const { getState, saveState } = require('../controllers/stateController');

const router = express.Router();

router.get('/:key', getState);
router.put('/:key', saveState);

module.exports = router;

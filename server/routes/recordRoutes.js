const express = require('express');
const { getRecords, createRecord } = require('../controllers/recordController');

const router = express.Router();

router.get('/records', getRecords);
router.post('/records', createRecord);

module.exports = router;

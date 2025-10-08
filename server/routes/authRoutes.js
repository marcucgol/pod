const express = require('express');
const { listContractors, login } = require('../controllers/authController');

const router = express.Router();

router.get('/contractors', listContractors);
router.post('/login', login);

module.exports = router;

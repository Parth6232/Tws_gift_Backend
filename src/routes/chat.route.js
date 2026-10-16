const express = require('express');
const { chat } = require('../controllers/chat.controller');
const rateLimit = require('../middleware/rateLimit.middleware');
const router = express.Router();

// Public endpoint hai, isliye IP par 20 requests/minute ki limit
router.post('/', rateLimit({ windowMs: 60 * 1000, max: 20 }), chat);

module.exports = router;
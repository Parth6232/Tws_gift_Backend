const express = require('express');
const { createUser, listUsers, updatePermissions, setStatus } = require('../controllers/user.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect, adminOnly);

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id/permissions', updatePermissions);
router.patch('/:id/status', setStatus);

module.exports = router;
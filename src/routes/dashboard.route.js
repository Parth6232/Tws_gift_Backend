const express = require('express');
const { getStats, getTeam, getActivity, getUserProducts } = require('../controllers/dashboard.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/team', getTeam);
router.get('/activity', getActivity);
router.get('/users/:id/products', getUserProducts);

module.exports = router;
// server/routes/carbonRoutes.js
const express = require('express');
const router = express.Router();
const { verifyAndMint } = require('../controllers/carbonController');

// POST route that React will hit: /api/carbon/mint
router.post('/mint', verifyAndMint);

module.exports = router;

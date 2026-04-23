// server/routes/carbonRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  verifyAndMint, getTradingData, handleAction,
  getNGOs, getCompanies, getCreditRequests, createCreditRequest
} = require('../controllers/carbonController');

// Set up Multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Core minting
router.post('/mint', verifyAndMint);

// Image upload
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image provided" });
  res.json({ success: true, filePath: `/uploads/${req.file.filename}` });
});

// Dynamic data endpoints
router.get('/trading-data', getTradingData);
router.post('/action', handleAction);

// Database-backed endpoints
router.get('/ngos', getNGOs);
router.get('/companies', getCompanies);
router.get('/requests', getCreditRequests);
router.post('/requests', createCreditRequest);

module.exports = router;

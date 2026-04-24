// server/routes/carbonRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  verifyAndMint, getTradingData, handleAction,
  getNGOs, getCompanies, getCreditRequests, createCreditRequest, getRegionalPrices, getImages
} = require('../controllers/carbonController');
const PlantationImage = require('../models/PlantationImage');

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

// Image upload — saves file and records in MongoDB
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image provided" });
  const filePath = `/uploads/${req.file.filename}`;
  try {
    await PlantationImage.create({
      filename: req.file.filename,
      filePath,
      originalName: req.file.originalname,
      ngoWallet: req.body.ngoWallet || '',
      location: req.body.location || '',
      notes: req.body.notes || '',
    });
  } catch (e) { console.error('Image DB save failed:', e.message); }
  res.json({ success: true, filePath });
});

// List uploaded images
router.get('/images', getImages);

// Dynamic data endpoints
router.get('/trading-data', getTradingData);
router.post('/action', handleAction);

// Database-backed endpoints
router.get('/ngos', getNGOs);
router.get('/companies', getCompanies);
router.get('/requests', getCreditRequests);
router.post('/requests', createCreditRequest);
router.get('/regional-prices', getRegionalPrices);

module.exports = router;

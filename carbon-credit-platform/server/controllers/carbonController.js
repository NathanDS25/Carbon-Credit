// server/controllers/carbonController.js
const { verifyWithSatellite } = require('../services/isroService');
const carbonContract = require('../config/blockchain');
const User = require('../models/user');
const CreditRequest = require('../models/CreditRequest');
const Trade = require('../models/Trade');
const ActionLog = require('../models/ActionLog');

// POST /api/carbon/mint
const verifyAndMint = async (req, res) => {
    try {
        const { ngoWallet, landAreaHectares } = req.body;

        if (!ngoWallet || !landAreaHectares) {
            return res.status(400).json({ error: "Missing ngoWallet or landAreaHectares" });
        }

        console.log(`\n🚀 API Triggered: Verifying ${landAreaHectares} hectares for ${ngoWallet}`);

        // 1. Call the Python Bridge
        const satelliteData = await verifyWithSatellite(ngoWallet, landAreaHectares);

        if (!satelliteData.verified) {
            return res.status(400).json({ 
                error: "Verification failed", 
                ndvi: satelliteData.ndvi,
                message: "Vegetation density is too low for credits." 
            });
        }

        console.log(`🌿 Python Analysis Complete: NDVI Score is ${satelliteData.ndvi}`);

        // 2. Execute Blockchain Minting
        console.log(`⛓️ Minting ${satelliteData.credits} credits on-chain...`);
        const tx = await carbonContract.mintCredits(ngoWallet, satelliteData.credits);
        console.log(`⏳ Waiting for block confirmation...`);
        await tx.wait();

        // 3. Update MongoDB — upsert so it works even without a pre-existing user record
        console.log(`🗄️ Updating MongoDB balance...`);
        await User.findOneAndUpdate(
            { walletAddress: ngoWallet },
            { 
                $inc: { 
                    creditBalance: satelliteData.credits,
                    treesPlanted: Math.floor(landAreaHectares * 100)
                } 
            },
            { upsert: true, new: true }
        );

        // 4. Record this as a trade
        await Trade.create({
            buyer: 'Carbon Registry',
            seller: ngoWallet.slice(0, 10) + '...',
            credits: satelliteData.credits,
            price: 15.5,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });

        res.status(200).json({
            success: true,
            creditsMinted: satelliteData.credits,
            ndviScore: satelliteData.ndvi,
            txHash: tx.hash,
            etherscanLink: `https://sepolia.etherscan.io/tx/${tx.hash}`
        });

    } catch (error) {
        console.error("❌ API Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// GET /api/carbon/trading-data  — now reads from MongoDB
const getTradingData = async (req, res) => {
    try {
        const recentTrades = await Trade.find().sort({ createdAt: -1 }).limit(10).lean();
        const basePrice = 15.0 + Math.random() * 2;
        const volume24h = recentTrades.reduce((sum, t) => sum + t.credits, 0) || 32000;

        res.status(200).json({
            currentPrice: basePrice.toFixed(2),
            volume24h,
            priceData: [
                { time: '00:00', price: parseFloat((basePrice - 1).toFixed(2)) },
                { time: '04:00', price: parseFloat((basePrice - 0.5).toFixed(2)) },
                { time: '08:00', price: parseFloat((basePrice - 0.2).toFixed(2)) },
                { time: '12:00', price: parseFloat((basePrice + 0.5).toFixed(2)) },
                { time: '16:00', price: parseFloat((basePrice + 0.1).toFixed(2)) },
                { time: '20:00', price: parseFloat((basePrice - 0.1).toFixed(2)) },
                { time: '24:00', price: parseFloat(basePrice.toFixed(2)) },
            ],
            marketShareData: [
                { name: 'Forest Conservation', value: 35, color: '#10b981' },
                { name: 'Reforestation', value: 28, color: '#34d399' },
                { name: 'Renewable Energy', value: 22, color: '#6ee7b7' },
                { name: 'Ocean Cleanup', value: 15, color: '#a7f3d0' },
            ],
            recentTrades: recentTrades.map((t, i) => ({ ...t, id: t._id || i }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/carbon/action  — persists to MongoDB
const handleAction = async (req, res) => {
    try {
        const { actionType, payload } = req.body;
        console.log(`\n🛎️  Action Received: [${actionType}]`, payload);
        await ActionLog.create({ actionType, payload });
        res.status(200).json({ success: true, message: `Action '${actionType}' logged.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/carbon/ngos  — real data from MongoDB
const getNGOs = async (req, res) => {
    try {
        const ngos = await User.find({ role: 'ngo' })
            .select('name creditBalance location rating activeProjects treesPlanted')
            .lean();
        res.status(200).json(ngos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/carbon/companies  — real data from MongoDB
const getCompanies = async (req, res) => {
    try {
        const companies = await User.find({ role: 'company' })
            .select('name industry location creditsNeeded creditBalance')
            .lean();
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/carbon/requests  — real credit requests from MongoDB
const getCreditRequests = async (req, res) => {
    try {
        const requests = await CreditRequest.find().sort({ createdAt: -1 }).lean();
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/carbon/requests  — create a new credit request
const createCreditRequest = async (req, res) => {
    try {
        const { companyName, creditsNeeded, purpose, deadline } = req.body;
        if (!companyName || !creditsNeeded || !purpose || !deadline) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        const newRequest = await CreditRequest.create({
            companyName, creditsNeeded: Number(creditsNeeded), purpose, deadline, status: 'pending'
        });
        res.status(201).json({ success: true, request: newRequest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { verifyAndMint, getTradingData, handleAction, getNGOs, getCompanies, getCreditRequests, createCreditRequest };



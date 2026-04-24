// server/controllers/carbonController.js
const { verifyWithSatellite } = require('../services/isroService');
const carbonContract = require('../config/blockchain');
const User = require('../models/user');
const CreditRequest = require('../models/CreditRequest');
const Trade = require('../models/Trade');
const ActionLog = require('../models/ActionLog');
const PlantationImage = require('../models/PlantationImage');

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

        // GEE returns: { ndviScore, credits, verified, satellite }
        if (!satelliteData.verified) {
            return res.status(400).json({ 
                error: "Verification failed", 
                ndviScore: satelliteData.ndviScore,
                message: "Vegetation density is too low for credits (NDVI < 0.4)." 
            });
        }

        console.log(`🌿 GEE Analysis Complete: NDVI Score is ${satelliteData.ndviScore}`);

        // 2. Execute Blockchain Minting
        console.log(`⛓️ Minting ${satelliteData.credits} credits on-chain...`);
        const creditsToMint = satelliteData.credits;
        const tx = await carbonContract.mintCredits(ngoWallet, creditsToMint);
        console.log(`⏳ Waiting for block confirmation...`);
        await tx.wait();

        // 3. Update MongoDB — upsert so it works even without a pre-existing user record
        console.log(`🗄️ Updating MongoDB balance...`);
        await User.findOneAndUpdate(
            { walletAddress: ngoWallet },
            { 
                $inc: { 
                    creditBalance: creditsToMint,
                    treesPlanted: Math.floor(landAreaHectares * 100)
                } 
            },
            { upsert: true, new: true }
        );

        // 4. Record this as a trade
        await Trade.create({
            buyer: 'Carbon Registry',
            seller: ngoWallet.slice(0, 10) + '...',
            credits: creditsToMint,
            price: 15.5,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });

        res.status(200).json({
            success: true,
            creditsMinted: creditsToMint,
            ndviScore: satelliteData.ndviScore,
            satellite: satelliteData.satellite,
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

// GET /api/carbon/regional-prices — regional carbon credit price data
const getRegionalPrices = async (req, res) => {
    try {
        // Real-world inspired regional carbon credit pricing (USD per tonne CO2)
        const regions = [
            { region: 'Western Ghats, India', lat: 11.66, lon: 76.04, price: 18.5, trend: '+3.2%', volume: 12400, ndviAvg: 0.72, type: 'Forest Conservation' },
            { region: 'Amazon Basin, Brazil', lat: -3.46, lon: -62.21, price: 24.3, trend: '+1.8%', volume: 89200, ndviAvg: 0.81, type: 'Rainforest' },
            { region: 'Congo Basin, Africa', lat: -1.65, lon: 23.97, price: 21.1, trend: '+2.5%', volume: 45600, ndviAvg: 0.79, type: 'Tropical Forest' },
            { region: 'Sundarbans, India', lat: 21.94, lon: 89.18, price: 16.8, trend: '-0.5%', volume: 8700, ndviAvg: 0.68, type: 'Mangrove' },
            { region: 'Borneo, Indonesia', lat: 1.66, lon: 113.38, price: 22.7, trend: '+4.1%', volume: 67300, ndviAvg: 0.77, type: 'Tropical Forest' },
            { region: 'Atlantic Forest, Brazil', lat: -23.55, lon: -46.63, price: 19.2, trend: '+0.9%', volume: 23100, ndviAvg: 0.65, type: 'Reforestation' },
            { region: 'Himalayan Foothills, India', lat: 29.39, lon: 79.46, price: 14.6, trend: '-1.2%', volume: 5400, ndviAvg: 0.58, type: 'Alpine Forest' },
            { region: 'Mekong Delta, Vietnam', lat: 10.45, lon: 105.63, price: 13.9, trend: '+0.3%', volume: 11200, ndviAvg: 0.54, type: 'Wetland' },
        ];
        res.status(200).json(regions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/carbon/images — list uploaded plantation images
const getImages = async (req, res) => {
    try {
        const images = await PlantationImage.find().sort({ createdAt: -1 }).limit(20).lean();
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { verifyAndMint, getTradingData, handleAction, getNGOs, getCompanies, getCreditRequests, createCreditRequest, getRegionalPrices, getImages };



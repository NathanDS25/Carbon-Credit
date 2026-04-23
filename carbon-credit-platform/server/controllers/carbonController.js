// server/controllers/carbonController.js
const { verifyWithSatellite } = require('../services/isroService');
const carbonContract = require('../config/blockchain');
const User = require('../models/user');

const verifyAndMint = async (req, res) => {
    try {
        const { ngoWallet, landAreaHectares } = req.body;

        if (!ngoWallet || !landAreaHectares) {
            return res.status(400).json({ error: "Missing ngoWallet or landAreaHectares" });
        }

        console.log(`\n🚀 API Triggered: Verifying ${landAreaHectares} hectares for ${ngoWallet}`);

        // 1. Call the Python Bridge (the "Brain")
        const satelliteData = await verifyWithSatellite(ngoWallet, landAreaHectares);

        if (!satelliteData.verified) {
            return res.status(400).json({ 
                error: "Verification failed", 
                ndvi: satelliteData.ndvi,
                message: "Vegetation density is too low for credits." 
            });
        }

        console.log(`🌿 Python Analysis Complete: NDVI Score is ${satelliteData.ndvi}`);

        // 2. Execute the Blockchain Minting
        console.log(`⛓️ Minting ${satelliteData.credits} credits on-chain...`);
        const tx = await carbonContract.mintCredits(ngoWallet, satelliteData.credits);
        
        console.log(`⏳ Waiting for block confirmation...`);
        await tx.wait(); 

        // 2.5 Update the NGO's balance in MongoDB
        console.log(`🗄️ Updating MongoDB to reflect the new balance...`);
        await User.findOneAndUpdate(
            { walletAddress: ngoWallet },
            { $inc: { creditBalance: satelliteData.credits } }
        );

        // 3. Send Success Response
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

module.exports = { verifyAndMint };

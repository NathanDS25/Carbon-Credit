// runMint.js
const { verifyISROData } = require('./server/services/isroVerifier');
const carbonContract = require('./server/config/blockchain');

async function testFullSystem() {
    try {
        console.log("🚀 Starting Automated Carbon Minting Cycle...\n");

        // We will use your own wallet address to act as the "NGO" just for this test
        const testNgoWallet = "0xDc76DF1Cd30343F9c6C63f0Cbc9D9B4E59Cf6ca7"; 
        const landSizeHectares = 5; // 5 hectares of land

        // Step 1: Call the ISRO Mock Verifier
        const credits = await verifyISROData(testNgoWallet, landSizeHectares);

        // Step 2: Mint the credits on the Sepolia Blockchain
        console.log(`\n⛓️ Initiating smart contract transaction to mint ${credits} credits...`);
        const tx = await carbonContract.mintCredits(testNgoWallet, credits);
        
        console.log(`⏳ Transaction sent to Sepolia! Waiting for block confirmation...`);
        
        // This pauses the script until the blockchain officially mines the block
        const receipt = await tx.wait(); 
        
        console.log(`\n🎉 Success! Credits permanently minted on-chain.`);
        console.log(`🔍 View Receipt on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);

    } catch (error) {
        console.error("\n❌ Process failed:", error.reason || error.message);
    }
}

testFullSystem();

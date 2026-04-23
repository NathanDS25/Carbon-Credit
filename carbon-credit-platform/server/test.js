// test.js
const carbonContract = require('./config/blockchain');

async function testBlockchainConnection() {
    console.log("Pinging the Sepolia blockchain...");
    
    try {
        // Calling the public 'admin' variable from your Solidity contract
        const adminAddress = await carbonContract.admin();
        
        console.log("✅ Connection Successful!");
        console.log("The Admin of this contract is:", adminAddress);
    } catch (error) {
        console.error("❌ Connection failed:", error);
    }
}

testBlockchainConnection();

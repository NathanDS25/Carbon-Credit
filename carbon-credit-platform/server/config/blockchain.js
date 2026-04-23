const { ethers } = require('ethers');
const path = require('path');

// Force dotenv to look exactly in the server folder
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Connect to the blockchain via Alchemy/Infura
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Load your contract ABI (copy this from Remix compilation tab)
const contractABI = require('./CarbonCreditABI.json');
const contractAddress = process.env.CONTRACT_ADDRESS;

const carbonContract = new ethers.Contract(contractAddress, contractABI, wallet);

module.exports = carbonContract;
const { ethers } = require('ethers');

const RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/syfluaqtoWHwav_YcntVj';
const PRIVATE_KEY = '0x61080a970e39b97ddfa49825c6b166a419de6f4814e5f314e14663041bfe29cb';

async function test() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    console.log('Connected to Sepolia! Current block:', blockNumber);

    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log('Wallet address:', wallet.address);
    console.log('Wallet balance (ETH):', ethers.formatEther(balance));
  } catch (error) {
    console.error('Error connecting to RPC:', error.message);
  }
}

test();

// server/seed.js
// Run with: node seed.js
// This populates your MongoDB with realistic initial data.

// Fix for Windows DNS blocking Node.js SRV lookups (required for MongoDB Atlas)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/user');
const CreditRequest = require('./models/CreditRequest');
const Trade = require('./models/Trade');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing seeded data (safe to re-run)
    await User.deleteMany({ email: { $in: [
      'greenearth@ngo.com', 'treeplant@ngo.com', 'forestguardians@ngo.com', 'carbonalliance@ngo.com',
      'greentech@company.com', 'ecologistics@company.com', 'sustainenergy@company.com', 'cleanair@company.com'
    ]}});
    await CreditRequest.deleteMany({});
    await Trade.deleteMany({});

    const hashedPass = await bcrypt.hash('password123', 10);

    // --- Seed NGOs ---
    const ngos = await User.insertMany([
      {
        name: 'Green Earth Foundation',
        email: 'greenearth@ngo.com',
        password: hashedPass,
        role: 'ngo',
        walletAddress: '0xDc76DF1Cd30343F9c6C63f0Cbc9D9B4E59Cf6ca7',
        creditBalance: 12000,
        treesPlanted: 45200,
        activeProjects: 8,
        location: 'Costa Rica',
        rating: 4.8
      },
      {
        name: 'TreePlant Initiative',
        email: 'treeplant@ngo.com',
        password: hashedPass,
        role: 'ngo',
        creditBalance: 8500,
        treesPlanted: 32100,
        activeProjects: 5,
        location: 'India',
        rating: 4.9
      },
      {
        name: 'Forest Guardians',
        email: 'forestguardians@ngo.com',
        password: hashedPass,
        role: 'ngo',
        creditBalance: 15000,
        treesPlanted: 67300,
        activeProjects: 12,
        location: 'Brazil',
        rating: 4.7
      },
      {
        name: 'Carbon Offset Alliance',
        email: 'carbonalliance@ngo.com',
        password: hashedPass,
        role: 'ngo',
        creditBalance: 6200,
        treesPlanted: 18900,
        activeProjects: 3,
        location: 'Kenya',
        rating: 4.6
      }
    ]);
    console.log(`🌿 Seeded ${ngos.length} NGOs`);

    // --- Seed Companies ---
    const companies = await User.insertMany([
      {
        name: 'GreenTech Industries',
        email: 'greentech@company.com',
        password: hashedPass,
        role: 'company',
        industry: 'Manufacturing',
        location: 'California, USA',
        creditsNeeded: 5000,
        creditBalance: 0
      },
      {
        name: 'EcoLogistics Corp',
        email: 'ecologistics@company.com',
        password: hashedPass,
        role: 'company',
        industry: 'Transportation',
        location: 'Berlin, Germany',
        creditsNeeded: 3200,
        creditBalance: 0
      },
      {
        name: 'SustainEnergy Ltd',
        email: 'sustainenergy@company.com',
        password: hashedPass,
        role: 'company',
        industry: 'Energy',
        location: 'Tokyo, Japan',
        creditsNeeded: 8500,
        creditBalance: 0
      },
      {
        name: 'CleanAir Solutions',
        email: 'cleanair@company.com',
        password: hashedPass,
        role: 'company',
        industry: 'Industrial',
        location: 'London, UK',
        creditsNeeded: 2100,
        creditBalance: 0
      }
    ]);
    console.log(`🏢 Seeded ${companies.length} Companies`);

    // --- Seed Credit Requests ---
    await CreditRequest.insertMany([
      {
        companyId: companies[0]._id,
        companyName: companies[0].name,
        creditsNeeded: 5000,
        purpose: 'Manufacturing emissions offset',
        deadline: '2026-05-30',
        status: 'active'
      },
      {
        companyId: companies[1]._id,
        companyName: companies[1].name,
        creditsNeeded: 3200,
        purpose: 'Logistics carbon neutrality',
        deadline: '2026-06-15',
        status: 'pending'
      },
      {
        companyId: companies[2]._id,
        companyName: companies[2].name,
        creditsNeeded: 8500,
        purpose: 'Energy sector compliance Q3',
        deadline: '2026-07-01',
        status: 'pending'
      }
    ]);
    console.log('📋 Seeded Credit Requests');

    // --- Seed Recent Trades ---
    const basePrice = 15.5;
    await Trade.insertMany([
      { buyer: 'GreenTech Industries', seller: 'Green Earth Foundation', credits: 500, price: basePrice, time: '14:32' },
      { buyer: 'EcoLogistics Corp', seller: 'TreePlant Initiative', credits: 320, price: basePrice - 0.1, time: '14:28' },
      { buyer: 'CleanAir Solutions', seller: 'Carbon Offset Alliance', credits: 750, price: basePrice + 0.2, time: '14:15' },
      { buyer: 'SustainEnergy Ltd', seller: 'Forest Guardians', credits: 1200, price: basePrice - 0.3, time: '14:05' },
    ]);
    console.log('📈 Seeded Trade History');

    console.log('\n🎉 Database seeded successfully! You can now start your server.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();

// server/services/isroService.js
const { spawn } = require('child_process');
const path = require('path');

const verifyWithSatellite = (ngoWallet, landArea) => {
    return new Promise((resolve, reject) => {
        // Find the python script path
        const pythonScript = path.join(__dirname, 'gee_verifier.py');
        
        // Spawn Python process with GEE project ID env var
        const pythonProcess = spawn('python', [pythonScript, '11.6643', '76.0429', String(landArea)], {
            env: { ...process.env, GEE_PROJECT_ID: process.env.GEE_PROJECT_ID || 'carboncredits-494302' }
        });

        let resultData = "";

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject("Python script failed to execute.");
            } else {
                try {
                    resolve(JSON.parse(resultData));
                } catch (e) {
                    reject("Failed to parse Python output.");
                }
            }
        });
    });
};

module.exports = { verifyWithSatellite };
